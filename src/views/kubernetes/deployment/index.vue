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
              @click="getDeploymentList"
            >搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="deploymentList">
          <el-table-column width="5" align="center" />
          <el-table-column
            label="Name"
            align="center"
            prop="metadata.name"
            :show-overflow-tooltip="true"
          />

          <el-table-column label="Ready" align="center" :show-overflow-tooltip="true">
            <template
              slot-scope="scope"
            >{{ scope.row.status.readyReplicas }} / {{ scope.row.status.replicas }}</template>
          </el-table-column>

          <el-table-column
            label="Up to Date"
            align="center"
            prop="status.updatedReplicas"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Available"
            align="center"
            prop="status.availableReplicas"
            :show-overflow-tooltip="true"
          />
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
              <router-link
                :to="'/kubernetes/deployment/'+scope.row.metadata.namespace+'/'+scope.row.metadata.name"
              >
                <el-button
                  v-permisaction="['deployment:deployment:info']"
                  type="text"
                  icon="el-icon-info"
                >View</el-button>
              </router-link>
              <el-button
                v-permisaction="['deployment:deployment:patch']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleRestart(scope.row)"
              >重启</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-tag class="pagination-small-left" type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" :center="true" :destroy-on-close="true">
          <div class="editor-container">
            <json-editor ref="jsonEditor" v-model="deploymentInfo" />
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
  changeDeployment,
  getDeployment,
  listDeployment,
  restartDeployment
} from '@/api/kubernetes/deployment'

export default {
  name: 'Deployment',
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
      // deployment列表
      deploymentList: [],
      // deployment信息
      deploymentInfo: {},
      detailParams: {
        name: '',
        namespace: ''
      }
    }
  },
  created() {
    this.getNamespaceList()
    this.getDeploymentList()
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
    getDeploymentList() {
      this.loading = true
      const namespaceName = this.queryParams.namespace
      listDeployment(namespaceName).then((response) => {
        this.deploymentList = response.data.items
        this.total = this.deploymentList.length
        this.loading = false
      })
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      this.detailParams.name = row.metadata.name
      this.detailParams.namespace = row.metadata.namespace
      getDeployment(this.detailParams.namespace, this.detailParams.name).then(
        (response) => {
          this.deploymentInfo = response.data
          this.open = true
          this.title = 'deployment信息'
        }
      )
    },
    /** 重启deployment按钮操作 */
    handleRestart(row) {
      const deploymentName = row.metadata.name
      const namespaceName = row.metadata.namespace
      this.$confirm(
        '是否重启 ' + namespaceName + '/' + deploymentName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return restartDeployment(namespaceName, deploymentName)
        })
        .then(() => {
          this.getDeploymentList()
          this.msgSuccess('重启成功')
        })
        .catch(function() {})
    },
    submitJson() {
      // console.log(this.deploymentInfo);
      const deploymentName = this.detailParams.name
      const namespaceName = this.detailParams.namespace
      const deploymentInfo = this.deploymentInfo
      this.$confirm(
        '是否更新 ' + namespaceName + '/' + deploymentName + ' ?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        changeDeployment(namespaceName, deploymentName, deploymentInfo).then(
          (response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.deploymentInfo = response.data
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

<style>
.el-dialog__body {
  height: 80vh;
  overflow: auto;
}

.editor-container {
  position: relative;
  height: 100%;
}
</style>
