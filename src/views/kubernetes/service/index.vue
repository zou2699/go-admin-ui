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
            <el-button type="primary" icon="el-icon-search" size="medium" @click="getServiceList">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="serviceList">
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="类型" prop="spec.type" align="center" />
          <el-table-column label="ClusterIP" prop="spec.clusterIP" align="center" />
          <el-table-column label="Ports" align="center">
            <template slot-scope="scope">
              <div v-for="(port,index) in scope.row.spec.ports" :key="index">
                <el-tag type="warning">protocol: {{ port.protocol }}</el-tag>
                <el-tag type="success">port: {{ port.port }}</el-tag>
                <el-tag v-if="'nodePort' in port">nodePort: {{ port.nodePort }}</el-tag>
                <br>
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

        <el-tag class="pagination-small-left" type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" :center="true">
          <el-card>
            <pre> {{ serviceInfo }}</pre>
          </el-card>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listNamespace } from '@/api/kubernetes/namespace'
import { getService, listService } from '@/api/kubernetes/service'

export default {
  name: 'Deployment',
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
      serviceInfo: {}
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
      const serviceName = row.metadata.name
      const namespaceName = row.metadata.namespace
      getService(namespaceName, serviceName).then((response) => {
        this.serviceInfo = response.data
        this.open = true
        this.title = 'deployment信息'
      })
    }
  }
}
</script>
