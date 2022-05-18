<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <div style="display: inline; margin-right: 10px">
        <span style="display: inline; margin-right: 10px">项目</span>
        <el-select
          v-model="projectValue"
          placeholder="选择项目"
          @visible-change="handleVisibleChange"
          @change="handleProjectChange"
          style="width: 150px"
          value-key="name"
        >
          <el-option
            v-for="item in userProv"
            :key="item.name"
            :label="item.name"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
      <div style="display: inline; margin-right: 100px">
        <span style="display: inline; margin-right: 10px">环境</span>
        <el-select
          v-model="envValue"
          placeholder="选择环境"
          style="width: 150px"
          @change="handleEnvChange"
          value-key="name"
        >
          <el-option
            v-for="item in envList"
            :key="item.index"
            :label="item.name"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <span>hello,{{ userName }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item> 主页 </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Tabs from "@/components/Tabs";

export default {
  data() {
    return {
      userProv: [],
      projectValue: {},
      envList: [],
      envValue: "",
      projectAndEnv: {
        projectValue: "",
        envValue: "",
        id: "",
      },
      userName:''
    };
  },
  components: {
    Breadcrumb,
    Hamburger,
    Tabs
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "prov", "name", "id"]),
    id: {
      get() {},
      set() {},
    },
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    handle() {
      console.log(this.$store.state);
    },
    async handleVisibleChange() {
      let result = await this.$API.userList.reqUserList();
      this.userProv = result.data.prov;
      console.log(this.userProv);
    },
    handleProjectChange(value) {
      this.envList = this.projectValue.env;
      this.envValue = "";
      // console.log(this.envList);
      this.projectAndEnv.projectValue = value.name;
      console.log(value);
    },
    handleEnvChange(value) {
      this.projectAndEnv.envValue = value.name;
      this.projectAndEnv.id = value.id;
      console.log(this.projectAndEnv.id);
      this.$store.commit("user/SET_ID", this.projectAndEnv.id);
      console.log(this.$store.getters.id);
    },
  },
  // created() {
  //   //在页面加载时读取localStorage里的状态信息
  //   if (localStorage.getItem("store")) {
  //     this.$store.replaceState(
  //       Object.assign(
  //         {},
  //         this.$store.state,
  //         JSON.parse(localStorage.getItem("store"))
  //       )
  //     );
  //   }
  //   //在页面刷新时将vuex里的信息保存到localStorage里
  //   window.addEventListener("beforeunload", () => {
  //     localStorage.setItem("store", JSON.stringify(this.$store.state));
  //   });
  // },
  mounted() {
    this.id = "";
    this.$store.commit("user/SET_ID", this.projectAndEnv.id);
    this.userName = localStorage.getItem("name").replace(/^\"|\"$/g, '')

  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
