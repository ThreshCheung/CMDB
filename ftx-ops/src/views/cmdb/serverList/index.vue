<template>
  <el-container>
    <el-header>
      <div>
        <el-input
          type="captcha"
          placeholder="搜索"
          style="text-align: left; width: 40%"
          v-model="q"
        >
        </el-input
        ><el-button
          type="primary"
          style="display: inline; margin-left: 20px"
          @click="handleSearch"
          >搜索</el-button
        >
      </div>
    </el-header>
    <el-main>
      <div>
        <el-table style="width: 100%" border :data="serverList">
          <el-table-column
            header-align="center"
            align="center"
            prop="hostname"
            label="主机名"
          >
          </el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            label="ip"
          >
          <template slot-scope="scope">
            公网ip:{{scope.row.ip}}
            <br>
            内网ip:{{scope.row.lan_ip}}
          </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="width"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-tag type="primary" v-if="row.status == 'RUNNING'"
                >RUNNING</el-tag
              >
              <el-tag type="danger" v-if="row.status == 'FAILED'">失败</el-tag>
              <el-tag type="success" v-if="row.status == 'SUCCESS'"
                >成功</el-tag
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 20px; text-align: center"
          :current-page="currentPage"
          :page-sizes="[10, 15, 20]"
          :page-size="pageSize"
          layout=" prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      serverList: [],
      total: 0,
      q:''
    };
  },
  methods: {
    async getServerList() {
      const result = await this.$API.serverList.reqServerList(
        this.currentPage,
        this.pageSize,
        this.q
      );
      this.serverList = result.data;
      this.total = result.count;
      console.log(result);
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getServerList();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getServerList();
    },
    handleSearch(){
      this.getServerList()
    }
  },
  mounted() {
    this.getServerList();
  },
};
</script>

<style>
</style>