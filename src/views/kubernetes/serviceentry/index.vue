<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="命名空间" prop="namespace">
            <el-select v-model="queryParams.namespace" placeholder="请选择命名空间">
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
              @click="getServiceEntryList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="serviceEntryList">
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="hosts" align="center">
            <template slot-scope="scope">
              <div v-for="(host,index) in scope.row.spec.hosts" :key="index">
                <el-tag color="white">{{ host }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="addresses" align="center">
            <template slot-scope="scope">
              <div v-for="(address,index) in scope.row.spec.addresses" :key="index">
                <el-tag color="white">{{ address }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="ports" align="center">
            <template slot-scope="scope">
              <div v-for="(port,index) in scope.row.spec.ports" :key="index">
                <el-tag :type="index | statusFilter" color="white">name: {{ port.name }}</el-tag>
                <el-tag :type="index | statusFilter" color="white">protocol:{{ port.protocol }}</el-tag>
                <el-tag :type="index | statusFilter" color="white">number:{{ port.number }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" align="center">
            <template slot-scope="scope">{{ scope.row.metadata.creationTimestamp | parseTime }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['deployment:deployment:query']"
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
          class="se-dialog"
          :visible.sync="open"
          :center="true"
          :destroy-on-close="true"
        >
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="serviceEntryInfo" />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitJson">提交</el-button>
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
  ChangeServiceEntry,
  getServiceEntry,
  listServiceEntry
} from '@/api/kubernetes/istio'

export default {
  name: 'ServiceEntry',
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
        namespace: 'ecommerce-cloud'
      },
      // namespace列表
      namespaceList: [],
      // service列表
      serviceEntryList: [],
      // service信息
      serviceEntryInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
    }
  },
  created() {
    this.getNamespaceList()
    this.getServiceEntryList()
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
    getServiceEntryList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listServiceEntry(namespaceName)
        .then((response) => {
          this.serviceEntryList = response.data.items
          this.total = this.serviceEntryList.length
          this.loading = false
        })
        .catch((this.loading = false))
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getServiceEntry(this.detailParams.namespace, this.detailParams.name).then(
        (response) => {
          this.serviceEntryInfo = response.data
          this.open = true
          this.title = response.data.metadata.name + ' serviceEntry信息'
        }
      )
    },
    submitJson() {
      // console.log(this.serviceEntryInfo);
      const serviceEntryName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const serviceEntryInfo = this.serviceEntryInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + serviceEntryName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ChangeServiceEntry(
          namespaceName,
          serviceEntryName,
          serviceEntryInfo
        ).then((response) => {
          if (response.code === 200) {
            this.msgSuccess('修改成功')
            this.serviceEntryInfo = response.data
          } else {
            this.msgError(response.msg)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.se-dialog .el-dialog__body {
  height: 90%;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
