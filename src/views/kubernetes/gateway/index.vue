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
              @click="getGatewayList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          stripe
          style="width: 100%"
          :data="gatewayList"
          border
        >
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="selector" align="center">
            <template slot-scope="scope">
              <div v-for="(value, key) in scope.row.spec.selector" :key="key">
                <el-tag>{{ key }}: {{ value }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="servers" align="center">
            <template slot-scope="scope">
              <div
                v-for="(server, index) in scope.row.spec.servers"
                :key="index"
              >
                <el-tag
                  v-for="(host, i) in server.hosts"
                  :key="i"
                >host: {{ host }}</el-tag>
                <br>
                <el-tag type="success">name: {{ server.port.name }}</el-tag>
                <el-tag type="success">port: {{ server.port.number }}</el-tag>
                <el-tag
                  type="success"
                >protocol: {{ server.port.protocol }}</el-tag>
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
                v-permisaction="['gateway:gateway:json']"
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
          class="gw-dialog"
          :visible.sync="open"
          :center="true"
          :destroy-on-close="true"
        >
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="gatewayInfo" />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button
              v-permisaction="['gateway:gateway:edit']"
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
import { ChangeGateway, getGateway, listGateway } from '@/api/kubernetes/istio'

export default {
  name: 'Gateway',
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
      gatewayList: [],
      // service信息
      gatewayInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
    }
  },
  created() {
    this.getNamespaceList()
    this.getGatewayList()
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
    getGatewayList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listGateway(namespaceName).then((response) => {
        this.gatewayList = response.data.items
        this.total = this.gatewayList.length
        this.loading = false
      })
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getGateway(this.detailParams.namespace, this.detailParams.name).then(
        (response) => {
          this.gatewayInfo = response.data
          this.open = true
          this.title = response.data.metadata.name + ' gateway信息'
        }
      )
    },
    submitJson() {
      // console.log(this.gatewayInfo);
      const gatewayName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const gatewayInfo = this.gatewayInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + gatewayName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ChangeGateway(namespaceName, gatewayName, gatewayInfo).then(
          (response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.gatewayInfo = response.data
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
.gw-dialog .el-dialog__body {
  height: 70%;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
