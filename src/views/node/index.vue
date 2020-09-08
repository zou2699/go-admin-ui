<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="节点名称" prop="title">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入节点名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" stripe style="width: 100%" :data="nodeList">
          <el-table-column width="5" align="center" />
          <el-table-column
            label="节点名"
            align="center"
            prop="metadata.name"
            :show-overflow-tooltip="true"
          />
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
          <el-table-column
            label="创建时间"
            align="center"
            prop="metadata.creationTimestamp"
            :show-overflow-tooltip="true"
          />
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

        <el-tag class="pagination-small-left" type="info" effect="plain"> 共{{ total }}条</el-tag>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" :fullscreen="true" :center="true">
          <el-row :gutter="12" class="el-row">
            <el-col :span="8">
              <el-card class="nodeInfo-box-card">
                <div slot="header" class="clearfix">
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

            <el-col :span="8">
              <el-card class="nodeTaints-box-card">
                <div slot="header" class="clearfix">
                  <span>污点</span>
                </div>
                <div v-for="(nodeTaint,index) in nodeTaints" :key="index">
                  <el-tag size="medium">{{ nodeTaint.key }}</el-tag>
                  <el-tag size="medium" type="warning">{{ nodeTaint.effect }}</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card>
            <div slot="header" class="clearfix">
              <span>节点状态</span>
            </div>
            <el-table :data="nodeConditions" center="true" style="width: 100%">
              <el-table-column prop="type" label="type" align="center" />
              <el-table-column prop="status" label="status" align="center" />
              <el-table-column prop="reason" label="reason" align="center" />
              <el-table-column prop="message" label="message" align="center" />
              <el-table-column prop="lastHeartbeatTime" label="lastHeartbeatTime" align="center" />
              <el-table-column prop="lastTransitionTime" label="lastTransitionTime" align="center" />
            </el-table>
          </el-card>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getNode, listNode } from '@/api/node'

export default {
  name: 'Config',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
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
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.nodeConditions = []
      this.nodeInfo = {}
      this.resetForm('form')
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
      this.reset()
      const nodeName = row.metadata.name
      getNode(nodeName).then((response) => {
        this.nodeConditions = response.data.status.conditions
        this.nodeInfo = response.data.status.nodeInfo
        this.nodeTaints = response.data.spec.taints
        this.open = true
        this.title = '节点信息'
      })
    }
  }
}
</script>

<style>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.nodeInfo-box-card {
  width: 480px;
  height: 100%;
}
.nodeTaints-box-card {
  width: 480px;
  height: 100%;
}
.el-row {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}
.pagination-small-left {
    float: right;
}
</style>
