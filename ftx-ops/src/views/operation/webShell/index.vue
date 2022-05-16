<template>
  <el-container>
    <el-card shadow="hover" style="overflow: auto">
      <el-header></el-header>
      <el-main>
        <el-button type="primary" @click="handleWs()">test</el-button>
        <el-scrollbar
              style="height: 600px"
              wrap-class="default-scrollbar__wrap"
            >
        <el-tree
          indent:8
          :data="sshList"
          :props="defaultProps"
          ref="tree"
          @node-click="selectHost"
        >
        </el-tree>
        </el-scrollbar>
      </el-main>
    </el-card>
    <el-card shadow="hover" style="height: 890px">
      <el-header></el-header>
      <el-main>
        <div class="container">
          <div id="terminal-container"></div>
        </div>
      </el-main>
    </el-card>
  </el-container>
</template>

<script>
import "xterm/lib/xterm.css";
import { Terminal } from "xterm";
import * as fit from "xterm/lib/addons/fit/fit";
Terminal.applyAddon(fit); // Apply the `fit` addon
export default {
  data() {
    return {
      copy: "",
      p: "webssh",
      sshList: [],
      defaultProps: {
        children: "children",
        label: "title",
      },
      form: {
        host_id: "",
      },
      ws_id: "",
      connectHost: {},
    };
  },
  methods: {
    async getSshList() {
      const result = await this.$API.sshList.reqSshList(this.p);
      // console.log(this.sshList[1].children[0].children[0].id);
      this.sshList = result.data;
      console.log(this.sshList);
    },
    async getWsId() {
      const result = await this.$API.sshList.reqWsId(this.form);
      this.ws_id = result.data.ws_id;
      console.log(this.ws_id);
    },
    handleWs() {
      let terminalContainer = document.getElementById("terminal-container");
      let term = new Terminal({
        // 光标闪烁
        cursorBlink: true,
      });
      term.open(terminalContainer, true);
      term.fit();
      let websocket = new WebSocket(
        `ws:192.168.12.136:8001/ssh/ws?id=` + this.ws_id
      ); //地址
      websocket.binaryType = "arraybuffer";
      //连接成功
      websocket.onopen = function (evt) {
        console.log("onopen", evt);
        term.writeln("连接成功");
      };
      //输入
      term.on("data", function (data) {
        console.log("data", data);
        term.write(data);
        websocket.send(new TextEncoder().encode("\x00" + data));
      });
      //返回
      websocket.onmessage = function (evt) {
        let str = new TextDecoder().decode(evt.data);
        term.write(str);
      };
      //关闭
      websocket.onclose = function (evt) {
        term.writeln("连接关闭");
        console.log("close", evt);
      };
      //错误
      websocket.onerror = function (evt) {
        console.log("error", evt);
      };
      //选中 复制
      term.on("selection", function () {
        if (term.hasSelection()) {
          this.copy = term.getSelection();
        }
      });
      term.attachCustomKeyEventHandler(function (ev) {
        //粘贴 ctrl+v
        if (ev.keyCode == 86 && ev.ctrlKey) {
          websocket.send(new TextEncoder().encode("\x00" + this.copy));
        }
      });
    },
    selectHost(val) {
      console.log(val);
      if (val.cpu) {
        this.connectHost = val;
        this.form.host_id = this.connectHost.id
        console.log(JSON.stringify(this.form));
        this.getWsId()

        setTimeout(() => {
          this.handleWs();
        }, 2000);
      } else {
        this.connectHost = "";
      }
    },
  },
  mounted() {
    this.getSshList();
    this.getWsId();
  },
};
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.default-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
