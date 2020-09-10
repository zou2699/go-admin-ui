<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="节点名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入节点名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="nodeList">
          <el-table-column label="节点名" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-tag :type="scope.row.metadata.labels | masterFilter">{{ scope.row.metadata.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="节点IP" align="center" :show-overflow-tooltip="true">
            <template
              slot-scope="scope"
            >{{ scope.row.metadata.annotations['flannel.alpha.coreos.com/public-ip'] }}</template>
          </el-table-column>
          <el-table-column label="cpu/mem" align="center" :show-overflow-tooltip="true">
            <template
              slot-scope="scope"
            >{{ scope.row.status.capacity.cpu }} / {{ scope.row.status.capacity.memory }}</template>
          </el-table-column>
          <el-table-column
            label="runc版本"
            align="center"
            prop="status.nodeInfo.containerRuntimeVersion"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="creationTimestamp" align="center">
            <template slot-scope="scope">{{ scope.row.metadata.creationTimestamp | parseTime }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['node:node:query']"
                type="text"
                icon="el-icon-view"
                @click="handleDetail(scope.row)"
              >查看详细信息</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-tag type="info" effect="plain">共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog
          :title="title"
          :visible.sync="open"
          :fullscreen="false"
          width="1200px"
          :destroy-on-close="true"
          class="node_dialog"
        >
          <el-row :gutter="24" class="node-el-row">
            <el-col :span="12" class="node-el-col">
              <el-card class="nodeInfo-box-card">
                <div slot="header">
                  <span>系统信息</span>
                </div>
                <el-form ref="form" :model="nodeInfo" label-position="left" label-width="150px">
                  <el-form-item label="操作系统">
                    <div>{{ nodeInfo.operatingSystem }}</div>
                  </el-form-item>
                  <el-form-item label="体系架构">
                    <div>{{ nodeInfo.architecture }}</div>
                  </el-form-item>
                  <el-form-item label="操作系统镜像">
                    <div>{{ nodeInfo.osImage }}</div>
                  </el-form-item>
                  <el-form-item label="操作系统内核">
                    <div>{{ nodeInfo.kernelVersion }}</div>
                  </el-form-item>
                  <el-form-item label="容器引擎">
                    <div>{{ nodeInfo.containerRuntimeVersion }}</div>
                  </el-form-item>
                  <el-form-item label="kubelet">
                    <div>{{ nodeInfo.kubeletVersion }}</div>
                  </el-form-item>
                  <el-form-item label="kube proxy">
                    <div>{{ nodeInfo.kubeProxyVersion }}</div>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>

            <el-col :span="12" class="node-el-col">
              <el-card class="nodeTaints-box-card">
                <div slot="header">
                  <span>污点</span>
                </div>
                <div v-for="(nodeTaint,index) in nodeTaints" :key="index">
                  <el-tag size="medium">{{ nodeTaint.key }}</el-tag>
                  <el-tag size="medium" type="warning">{{ nodeTaint.effect }}</el-tag>
                </div>
              </el-card>
            </el-col>

            <el-col :span="24" class="node-el-col">
              <el-card>
                <div slot="header">
                  <span>节点状态</span>
                </div>
                <el-table :data="nodeConditions" center="true" style="width: 100%">
                  <el-table-column prop="type" label="type" align="center" />
                  <el-table-column prop="status" label="status" align="center" />
                  <el-table-column prop="reason" label="reason" align="center" />
                  <el-table-column prop="message" label="message" align="center" />
                  <el-table-column label="lastHeartbeatTime" align="center">
                    <template slot-scope="scope">{{ scope.row.lastHeartbeatTime | parseTime }}</template>
                  </el-table-column>
                  <el-table-column label="lastTransitionTime" align="center">
                    <template slot-scope="scope">{{ scope.row.lastTransitionTime | parseTime }}</template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getNode, listNode } from '@/api/kubernetes/node'

export default {
  name: 'Node',
  filters: {
    masterFilter(labels) {
      if ('node-role.kubernetes.io/master' in labels) {
        return 'success'
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
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // node列表
      nodeList: [],

      // 查询参数
      queryParams: {
        name: undefined
      },
      // 表单参数
      nodeConditions: [],
      // node信息
      nodeInfo: {},
      nodeTaints: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listNode().then((response) => {
        this.nodeList = response.data.items
        this.total = this.nodeList.length
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      if (this.queryParams.name) {
        this.loading = true
        this.nodeList = []
        const nodeName = this.queryParams.name
        getNode(nodeName).then((response) => {
          this.nodeList.push(response.data)
          this.total = this.nodeList.length
          this.loading = false
        })
      } else {
        this.getList()
      }
    },
    /** 查询详细信息按钮操作 */
    handleDetail(row) {
      const nodeName = row.metadata.name
      getNode(nodeName).then((response) => {
        this.nodeConditions = response.data.status.conditions
        this.nodeInfo = response.data.status.nodeInfo
        this.nodeTaints = response.data.spec.taints
        this.open = true
        this.title = response.data.metadata.name + ' 节点信息'
      })
    }
  }
}
</script>

<style lang="scss">
.nodeInfo-box-card {
  width: 570px;
  height: 100%;
}
.nodeTaints-box-card {
  width: 570px;
  height: 100%;
}
.node-el-row {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}
.node-el-col {
  margin-bottom: 10px;
}
.node_dialog {
  display: flex;
  justify-content: center;
  align-items: Center;
  overflow: hidden;
  .el-dialog {
    margin: 0 auto !important;
    height: 90%;
    overflow: hidden;
    .el-dialog__body {
      position: absolute;
      left: 10px;
      top: 54px;
      bottom: 0;
      right: 0;
      padding: 0;
      z-index: 1;
      overflow: hidden;
      overflow-y: auto;
    }
  }
}
</style>
