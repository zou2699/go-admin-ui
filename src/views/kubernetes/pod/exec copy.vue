<template>
  <div>
    <div class="status-bar">  {{ namespaceName }} - {{ podName }} / {{ containerName }}
      <span v-if="status === 'ok'" class="ws-status-ok">{{ shell }} 已连接</span>
      <span v-else class="ws-status-err"> 已断开</span>
    </div>
    <div ref="terminal" class="console" />

  </div>

</template>

<script>
import { getToken } from '@/utils/auth'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'

export default {
  name: 'PodExec',
  // props: {
  //   socketURI: {
  //     type: String,
  //     default: ''
  //   }
  // },
  data() {
    return {
      namespaceName: '',
      podName: '',
      containerName: '',
      shell: 'sh',
      status: '',
      socketURI: ''
    }
  },
  created() {
    const WsHost = process.env.VUE_APP_BASE_API.replace('http', 'ws')
    this.namespaceName = this.$route.params.namespace
    this.podName = this.$route.params.pod
    this.containerName = this.$route.params.container
    this.shell = this.$route.query.shell
    if (!this.shell) {
      this.shell = 'sh'
    }
    // 构造socketURI
    this.socketURI = WsHost + '/k8s-api/api/v1/namespaces/' +
                     this.namespaceName + '/pods/' + this.podName + '/exec?' +
                     'shell=' + this.shell + '&container=' + this.containerName
  },
  mounted() {
    this.initSocket()
  },
  beforeDestroy() {
    this.socket.close()
    this.term.dispose()
  },
  methods: {
    initTerm() {
      const term = new Terminal({
        fontSize: 14,
        scrollback: 5000, // 回滚
        cols: 90,
        rows: 60,
        cursorBlink: true // 光标闪烁
        // theme: {
        //   foreground: 'yellow', // 字体
        //   background: '#060101', // 背景色
        //   cursor: 'help' // 设置光标
        // }
      })
      // xterm的socket组件与websocket实例结合
      const attachAddon = new AttachAddon(this.socket)
      term.loadAddon(attachAddon)
      // 加载自适应组件
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      // 在绑定的组件上初始化窗口
      //   term.open(document.getElementById('terminal'))
      term.open(this.$refs.terminal)

      // 窗口初始化后,按照浏览器窗口自适应大小
      fitAddon.fit()
      // 聚焦
      term.focus()
      term.scrollToBottom()
      this.term = term
      this.status = 'ok'
    },
    initSocket() {
      this.socket = new WebSocket(this.socketURI, getToken())
      this.socketOnClose()
      this.socketOnOpen()
      this.socketOnError()
    },
    socketOnOpen() {
      this.socket.onopen = () => {
        // 链接成功后
        this.initTerm()
      }
    },
    socketOnClose() {
      this.socket.onclose = () => {
        this.status = ''
        console.log('close socket')
      }
    },
    socketOnError() {
      this.socket.onerror = () => {
        this.status = ''
        console.log('socket 链接失败')
      }
    }
  }
}
</script>

<style lang="scss"  scoped>
.status-bar {
  background-color: rgb(58, 51, 51);
  color: rgb(255, 254, 255);
  font-weight: 500;
  padding: 8px 20px;
  line-height: 22px;
  text-align: center;

  .ws-status-ok {
    float: right;
    font-size: 14px;
    font-weight: 600;
    color: rgb(51, 255, 51);
  }
   .ws-status-err {
     float: right;
     font-size: 14px;
     font-weight: 600;
     color: rgb(255, 102, 0);
   }
}

</style>

