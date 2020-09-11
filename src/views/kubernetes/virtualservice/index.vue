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
              @click="getVirtualServiceList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="virtualServiceList">
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="gateways" align="center">
            <template slot-scope="scope">
              <div v-for="(gateway,index) in scope.row.spec.gateways" :key="index">
                <el-tag>{{ gateway }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="hosts" align="center">
            <template slot-scope="scope">
              <div v-for="(host,index) in scope.row.spec.hosts" :key="index">
                <span>{{ host }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="http match" align="center">
            <template slot-scope="scope">
              <div v-for="(h,i) in scope.row.spec.http" :key="i">
                <div v-for="(m,index) in h.match" :key="'h'+index">
                  <el-tag :type="i| statusFilter" color="white">prefix: {{ m.uri.prefix }}</el-tag>
                </div>
                <div v-for="(r,index) in h.route" :key="index">
                  <el-tag
                    :type="i| statusFilter"
                    color="white"
                  >route: {{ r.destination.host }}:{{ r.destination.port.number }}</el-tag>
                </div>
                <div v-if="'rewrite' in h">
                  <el-tag :type="i| statusFilter" color="white">rewrite: {{ h.rewrite }}</el-tag>
                </div>
                <div />
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
              >Yaml</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-tag type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" :center="true">
          <el-card>
            <pre> {{ virtualServiceInfo }}</pre>
          </el-card>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listNamespace } from '@/api/kubernetes/namespace'
import { getVirtualService, listVirtualService } from '@/api/kubernetes/istio'

export default {
  name: 'VirtualService',
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
      virtualServiceList: [],
      // service信息
      virtualServiceInfo: {}
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
      const serviceName = row.metadata.name
      const namespaceName = row.metadata.namespace
      getVirtualService(namespaceName, serviceName).then((response) => {
        this.virtualServiceInfo = response.data
        this.open = true
        this.title = 'virtualService信息'
      })
    }
  }
}
</script>
