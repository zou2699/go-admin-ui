<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="命名空间" prop="namespace">
            <el-select
              v-model="queryParams.namespace"
              placeholder="请选择命名空间"
            >
              <el-option
                v-for="item in namespaceList"
                :key="item.metadata.name"
                :label="item.metadata.name"
                :value="item.metadata.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="medium"
              @click="getServiceList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          stripe
          style="width: 100%"
          :data="serviceList"
          border
        >
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="类型" prop="spec.type" align="center" />
          <el-table-column
            label="ClusterIP"
            prop="spec.clusterIP"
            align="center"
          />
          <el-table-column label="Ports" align="center">
            <template slot-scope="scope">
              <div v-for="(port, index) in scope.row.spec.ports" :key="index">
                <el-tag type="warning">protocol: {{ port.protocol }}</el-tag>
                <el-tag type="success">port: {{ port.port }}</el-tag>
                <el-tag
                  v-if="'nodePort' in port"
                >nodePort: {{ port.nodePort }}</el-tag>
                <br>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center">
            <template slot-scope="scope">{{
              scope.row.metadata.creationTimestamp | parseTime
            }}</template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['service:service:json']"
                type="text"
                icon="el-icon-view"
                @click="handleDetail(scope.row)"
              >Json</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-tag type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog
          :title="title"
          class="svc-dialog"
          :visible.sync="open"
          :center="true"
          :destroy-on-close="true"
        >
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="serviceInfo" />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button
              v-permisaction="['service:service:edit']"
              type="primary"
              @click="submitJson"
            >提交修改</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { listNamespace } from '@/api/kubernetes/namespace'
import {
  changeService,
  getService,
  listService
} from '@/api/kubernetes/service'

export default {
  name: 'Service',
  components: { JsonEditor },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        namespace: 'default'
      },
      // namespace列表
      namespaceList: [],
      // service列表
      serviceList: [],
      // service信息
      serviceInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
    }
  },
  created() {
    this.getNamespaceList()
    this.getServiceList()
  },
  methods: {
    /** 查询参数列表 */
    getNamespaceList() {
      this.loading = true
      listNamespace().then((response) => {
        this.namespaceList = response.data.items
        this.loading = false
      })
    },
    getServiceList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listService(namespaceName).then((response) => {
        this.serviceList = response.data.items
        this.total = this.serviceList.length
        this.loading = false
      })
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getService(this.detailParams.namespace, this.detailParams.name).then(
        (response) => {
          this.serviceInfo = response.data
          this.open = true
          this.title = response.data.metadata.name + ' svc信息'
        }
      )
    },
    submitJson() {
      // console.log(this.serviceInfo);
      const serviceName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const serviceInfo = this.serviceInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + serviceName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        changeService(namespaceName, serviceName, serviceInfo).then(
          (response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.serviceInfo = response.data
            } else {
              this.msgError(response.msg)
            }
          }
        )
      })
    }
  }
}
</script>

<style lang="scss">
.svc-dialog .el-dialog__body {
  height: 70%;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
