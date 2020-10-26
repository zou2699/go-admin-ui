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
              @click="getDestinationRuleList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          stripe
          style="width: 100%"
          :data="destinationRuleList"
          border
        >
          <el-table-column label="名称" prop="metadata.name" align="center" />
          <el-table-column label="host">
            <template slot-scope="scope">{{ scope.row.spec.host }}</template>
          </el-table-column>

          <el-table-column label="loadBalancer" align="center">
            <template slot-scope="scope">
              <span>{{
                scope.row.spec.trafficPolicy.loadBalancer.simple
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="subsets" align="center">
            <template slot-scope="scope">
              <div v-for="(subset, i) in scope.row.spec.subsets" :key="i">
                <el-tag
                  :type="i | statusFilter"
                  color="white"
                >name: {{ subset.name }}</el-tag>

                <div v-for="(value, key) in subset.labels" :key="key">
                  <el-tag
                    :type="i | statusFilter"
                    color="white"
                  >labels: {{ key }}={{ value }}</el-tag>
                </div>
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
                v-permisaction="['destinationRule:destinationRule:json']"
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
          class="dr-dialog"
          :visible.sync="open"
          :center="true"
          :destroy-on-close="true"
        >
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="destinationRuleInfo" />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button
              v-permisaction="['destinationRule:destinationRule:edit']"
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
  ChangeDestinationRule,
  getDestinationRule,
  listDestinationRule
} from '@/api/kubernetes/istio'

export default {
  name: 'DestinationRule',
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
        namespace: this.$store.state.kubernetes.namespace
      },
      // namespace列表
      namespaceList: [],
      // service列表
      destinationRuleList: [],
      // service信息
      destinationRuleInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
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
      this.$store.dispatch('kubernetes/changeNamespace', namespaceName)
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
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getDestinationRule(
        this.detailParams.namespace,
        this.detailParams.name
      ).then((response) => {
        this.destinationRuleInfo = response.data
        this.open = true
        this.title = response.data.metadata.name + ' destinationRule信息'
      })
    },
    submitJson() {
      // console.log(this.destinationRuleInfo);
      const destinationRuleName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const destinationRuleInfo = this.destinationRuleInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + destinationRuleName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ChangeDestinationRule(
          namespaceName,
          destinationRuleName,
          destinationRuleInfo
        ).then((response) => {
          if (response.code === 200) {
            this.msgSuccess('修改成功')
            this.destinationRuleInfo = response.data
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
.dr-dialog .el-dialog__body {
  height: 90%;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
