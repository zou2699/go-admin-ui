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
              @click="getVirtualServiceList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          stripe
          style="width: 100%"
          :data="virtualServiceList"
          border
        >
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="gateways" align="center">
            <template slot-scope="scope">
              <div
                v-for="(gateway, index) in scope.row.spec.gateways"
                :key="index"
              >
                <el-tag>{{ gateway }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="hosts" align="center" width="120px">
            <template slot-scope="scope">
              <div v-for="(host, index) in scope.row.spec.hosts" :key="index">
                <span>{{ host }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="http match" align="center">
            <template slot-scope="scope">
              <div v-for="(h, i) in scope.row.spec.http" :key="i">
                <div v-for="(m, index) in h.match" :key="'h' + index">
                  <span
                    :class="i | statusFilter"
                  >prefix: {{ m.uri.prefix }}</span>
                </div>
                <div v-for="(r, index) in h.route" :key="index">
                  <span
                    :class="i | statusFilter"
                  >route: {{ r.destination.host }}:{{
                    r.destination.port.number
                  }}</span>
                </div>
                <div v-if="'rewrite' in h">
                  <span
                    :class="i | statusFilter"
                  >rewrite: {{ h.rewrite }}</span>
                </div>
                <div />
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
                v-permisaction="['virtualService:virtualService:json']"
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
          class="vs-dialog"
          :visible.sync="open"
          :center="true"
          :destroy-on-close="true"
        >
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="virtualServiceInfo" />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button
              v-permisaction="['virtualService:virtualService:edit']"
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
  ChangeVirtualService,
  getVirtualService,
  listVirtualService
} from '@/api/kubernetes/istio'

export default {
  name: 'VirtualService',
  components: { JsonEditor },
  filters: {
    statusFilter(status) {
      if (status % 2 === 0) {
        return 'http-match-even'
      } else {
        return 'http-match-odd'
      }
    }
  },
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
        namespace: this.$store.state.kubernetes.namespace
      },
      // namespace列表
      namespaceList: [],
      // service列表
      virtualServiceList: [],
      // service信息
      virtualServiceInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
    }
  },
  created() {
    this.getNamespaceList()
    this.getVirtualServiceList()
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
    getVirtualServiceList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      this.$store.dispatch('kubernetes/changeNamespace', namespaceName)
      listVirtualService(namespaceName)
        .then((response) => {
          this.virtualServiceList = response.data.items
          this.total = this.virtualServiceList.length
          this.loading = false
        })
        .catch((this.loading = false))
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getVirtualService(
        this.detailParams.namespace,
        this.detailParams.name
      ).then((response) => {
        this.virtualServiceInfo = response.data
        this.open = true
        this.title = response.data.metadata.name + ' virtualService信息'
      })
    },
    submitJson() {
      // console.log(this.virtualServiceInfo);
      const virtualServiceName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const virtualServiceInfo = this.virtualServiceInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + virtualServiceName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ChangeVirtualService(
          namespaceName,
          virtualServiceName,
          virtualServiceInfo
        ).then((response) => {
          if (response.code === 200) {
            this.msgSuccess('修改成功')
            this.virtualServiceInfo = response.data
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
.vs-dialog .el-dialog__body {
  height: 80vh;
  overflow: auto;
}
.editor-container {
  position: relative;
  height: 100%;
}
.http-match-even {
  background-color: white;
  border-color: #d1e9ff;
  color: #1890ff;
}
.http-match-odd {
  background-color: white;
  border-color: #1c6ebb;
  color: rgb(161, 143, 40);
}
</style>
