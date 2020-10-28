<template>

  <div id="terminal" class="console" />

</template>

<script>
import { getToken } from '@/utils/auth'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'

export default {
  name: 'PodLog',
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
      tailLines: 500,
      socketURI: ''
    }
  },
  created() {
    const WsHost = process.env.VUE_APP_BASE_API.replace('http', 'ws')
    this.namespaceName = this.$route.params && this.$route.params.namespace
    this.podName = this.$route.params && this.$route.params.pod
    this.containerName = this.$route.params && this.$route.params.container
    // 构造socketURI
    this.socketURI = WsHost + '/k8s-api/api/v1/namespaces/' + this.namespaceName + '/pods/' + this.podName + '/log?' +
    'tailLines=' + this.tailLines + '&container=' + this.containerName
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

      })
      // xterm的socket组件与websocket实例结合
      const attachAddon = new AttachAddon(this.socket)
      term.loadAddon(attachAddon)
      // 加载自适应组件
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      // 在绑定的组件上初始化窗口
      term.open(document.getElementById('terminal'))
      // 窗口初始化后,按照浏览器窗口自适应大小
      fitAddon.fit()
      // 聚焦
      term.focus()
      term.scrollToBottom()
      this.term = term
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
        // console.log('close socket')
      }
    },
    socketOnError() {
      this.socket.onerror = () => {
        // console.log('socket 链接失败')
      }
    }
  }
}
</script>
<style scoped>

</style>
