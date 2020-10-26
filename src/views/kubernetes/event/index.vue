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
              @click="getEventList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          stripe
          style="width: 100%"
          :data="eventList"
          border
          :default-sort="{ prop: 'lastTimestamp', order: 'descending' }"
        >
          <!-- 时间 类型 原因 对象 来源 消息 -->
          <el-table-column label="时间" prop="lastTimestamp">
            <template slot-scope="scope">{{
              scope.row.lastTimestamp | timeStringAgo
            }}</template>
          </el-table-column>

          <el-table-column label="类型">
            <template slot-scope="scope">
              <el-tag :type="scope.row.type | statusFilter">{{
                scope.row.type
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="原因">
            <template slot-scope="scope">{{ scope.row.reason }}</template>
          </el-table-column>

          <el-table-column label="对象">
            <template
              slot-scope="scope"
            >{{ scope.row.involvedObject.kind }}:
              {{ scope.row.involvedObject.name }}</template>
          </el-table-column>

          <el-table-column label="来源">
            <template
              slot-scope="scope"
            >{{ scope.row.source.component }},{{
              scope.row.source.host
            }}</template>
          </el-table-column>

          <el-table-column label="消息">
            <template slot-scope="scope">{{ scope.row.message }}</template>
          </el-table-column>
        </el-table>

        <el-tag
          class="pagination-small-left"
          type="info"
          effect="plain"
        >共{{ total }}条</el-tag>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listNamespace } from '@/api/kubernetes/namespace'
import { listEvent, watchEventList } from '@/api/kubernetes/event'

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
        namespace: this.$store.state.kubernetes.namespace
      },
      // namespace列表
      namespaceList: [],
      // deployment列表
      eventList: [],
      watchParams: {
        watch: true,
        resourceVersion: '',
        timeoutSeconds: 2
      },
      timer: 0,
      // deployment信息
      deploymentInfo: {}
    }
  },
  created() {
    this.getNamespaceList()

    this.getEventList()
  },
  mounted() {
    if (this.timer) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(() => {
        const namespaceName = this.queryParams.namespace
        watchEventList(namespaceName, this.watchParams).then((response) => {
          // console.log(response.data);
          if (
            response.data['Type'] !== 'ADDED' &&
            response.data['Type'] !== 'MODIFIED'
          ) {
            console.log('type:', response.data['Type'])
            return
          }
          this.watchParams.resourceVersion =
            response.data['Object']['metadata']['resourceVersion']
          this.eventList.push(response.data['Object'])

          if (response.data['Object']['type'] !== 'Normal') {
            console.log(response.data['Object']['message'])
            this.$notify({
              title: '收到警告事件',
              dangerouslyUseHTMLString: true,
              message: `
            <div>Name: ${response.data['Object']['involvedObject']['name']}</div>
            <div>Message: ${response.data['Object']['message']}</div>
          `,
              type: 'warning'
            })
          } else {
            this.$notify({
              title: '收到普通事件',
              dangerouslyUseHTMLString: true,
              message: `
            <div>Name: ${response.data['Object']['involvedObject']['name']}</div>
            <div>Message: ${response.data['Object']['message']}</div>
          `,
              type: 'success'
            })
          }
        })
      }, 2000)
    }
  },
  destroyed() {
    clearInterval(this.timer)
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
      this.$store.dispatch('kubernetes/changeNamespace', namespaceName)
      listEvent(namespaceName).then((response) => {
        this.eventList = response.data.items
        this.watchParams.resourceVersion =
          response.data.metadata.resourceVersion
        this.total = this.eventList.length
        this.loading = false
      })
    }
  }
}
</script>

