<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="命名空间名称" prop="name" label-width="100px">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入命名空间名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="namespaceList">
          <el-table-column
            label="命名空间"
            align="center"
            prop="metadata.name"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="status.phase"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="创建时间" align="center">
            <template slot-scope="scope">{{ scope.row.metadata.creationTimestamp | parseTime }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['namespace:namespace:detail']"
                type="text"
                icon="el-icon-view"
                @click="handleDetail(scope.row)"
              >查看详细信息</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-tag class="pagination-small-left" type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" :center="true" :destroy-on-close="true">
          <div class="editor-container">
            <json-editor
              ref="jsonEditor"
              v-model="namespaceInfo"
              :read-only="false"
              theme="default"
            />
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { getNamespace, listNamespace } from '@/api/kubernetes/namespace'

export default {
  name: 'Namespace',
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
        name: undefined
      },
      // namespace列表
      namespaceList: [],
      // namespace信息
      namespaceInfo: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listNamespace().then((response) => {
        this.namespaceList = response.data.items
        this.total = this.namespaceList.length
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      if (this.queryParams.name) {
        this.loading = true
        this.namespaceList = []
        const namespaceName = this.queryParams.name
        getNamespace(namespaceName).then((response) => {
          this.namespaceList.push(response.data)
          this.total = this.namespaceList.length
          this.loading = false
        })
      } else {
        this.getList()
      }
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      const namespaceName = row.metadata.name
      getNamespace(namespaceName).then((response) => {
        this.namespaceInfo = response.data
        this.open = true
        this.title = '命名空间信息'
      })
    }
  }
}
</script>

<style scoped>
.el-dialog__body {
  height: 80vh;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
