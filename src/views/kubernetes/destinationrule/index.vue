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
              @click="getDestinationRuleList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="destinationRuleList">
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="host">
            <template slot-scope="scope">{{ scope.row.spec.host }}</template>
          </el-table-column>

          <el-table-column label="loadBalancer" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.spec.trafficPolicy.loadBalancer.simple }}</span>
            </template>
          </el-table-column>

          <el-table-column label="subsets" align="center">
            <template slot-scope="scope">
              <div v-for="(subset,i) in scope.row.spec.subsets" :key="i">
                <el-tag :type="i| statusFilter" color="white">name: {{ subset.name }}</el-tag>

                <div v-for="(value,key) in subset.labels" :key="key">
                  <el-tag :type="i| statusFilter" color="white">labels: {{ key }}={{ value }}</el-tag>
                </div>
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
            <pre> {{ destinationRuleInfo }}</pre>
          </el-card>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listNamespace } from '@/api/kubernetes/namespace'
import {
  getDestinationRule,
  listDestinationRule
} from '@/api/kubernetes/istio'

export default {
  name: 'DestinationRule',
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
      destinationRuleList: [],
      // service信息
      destinationRuleInfo: {}
    }
  },
  created() {
    this.getNamespaceList()
    this.getDestinationRuleList()
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
    getDestinationRuleList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listDestinationRule(namespaceName)
        .then((response) => {
          this.destinationRuleList = response.data.items
          this.total = this.destinationRuleList.length
          this.loading = false
        })
        .catch((this.loading = false))
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      const serviceName = row.metadata.name
      const namespaceName = row.metadata.namespace
      getDestinationRule(namespaceName, serviceName).then((response) => {
        this.destinationRuleInfo = response.data
        this.open = true
        this.title = 'destinationRule信息'
      })
    }
  }
}
</script>
