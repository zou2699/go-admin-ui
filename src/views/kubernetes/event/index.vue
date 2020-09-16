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
            <el-button type="primary" icon="el-icon-search" size="medium" @click="getEventList">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="eventList">
          <!-- 时间 类型 原因 对象 来源 消息 -->
          <el-table-column label="时间">
            <template slot-scope="scope">{{ scope.row.lastTimestamp | timeStringAgo }}</template>
          </el-table-column>

          <el-table-column label="类型">
            <template slot-scope="scope">
              <el-tag :type="scope.row.type|statusFilter">{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="原因">
            <template slot-scope="scope">{{ scope.row.reason }}</template>
          </el-table-column>

          <el-table-column label="对象">
            <template
              slot-scope="scope"
            >{{ scope.row.involvedObject.kind }}: {{ scope.row.involvedObject.name }}</template>
          </el-table-column>

          <el-table-column label="来源">
            <template
              slot-scope="scope"
            >{{ scope.row.source.component }},{{ scope.row.source.host }}</template>
          </el-table-column>

          <el-table-column label="消息">
            <template slot-scope="scope">{{ scope.row.message }}</template>
          </el-table-column>
        </el-table>

        <el-tag class="pagination-small-left" type="info" effect="plain">共{{ total }}条</el-tag>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listNamespace } from '@/api/kubernetes/namespace'
import { listEvent } from '@/api/kubernetes/event'

export default {
  name: 'Event',
  filters: {
    statusFilter(type) {
      if (type !== 'Normal') {
        return 'warning'
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        namespace: 'jwell-cloud'
      },
      // namespace列表
      namespaceList: [],
      // deployment列表
      eventList: [],
      // deployment信息
      deploymentInfo: {}
    }
  },
  created() {
    this.getNamespaceList()

    this.getEventList()
  },
  methods: {
    getNamespaceList() {
      listNamespace().then((response) => {
        this.namespaceList = response.data.items
      })
    },
    getEventList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listEvent(namespaceName).then((response) => {
        this.eventList = response.data.items
        this.total = this.eventList.length
        this.loading = false
      })
    }
  }
}
</script>

