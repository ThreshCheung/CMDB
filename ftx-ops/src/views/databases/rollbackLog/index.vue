<template>
  <el-container>
    <el-header>
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
    </el-header>
    <el-main>
      <div>
        <el-table style="width: 100%" :data="rollbackLogList">
          <el-table-column width="50px" type="expand">
            <template slot-scope="scope">
              <el-table :data="scope.row.rollback_list" style="width: 100%">
                <el-table-column label="数据库名" width="width">
                  <template slot-scope="{ row }">
                    <span>{{ row.db_name }}</span>
                    <!-- <li v-for="(value,key,index) in row" :key="index">{{key}}</li> -->
                  </template>
                </el-table-column>
                <el-table-column label="回档表名" width="width">
                  <template slot-scope="{ row }">
                    <li
                      v-for="(value, key, index) in row.table_list"
                      :key="index"
                    >
                      {{ value.TableName }}
                    </li>
                  </template>
                </el-table-column>
                <el-table-column label="回档后表名" width="width">
                  <template slot-scope="{ row }">
                    <li
                      v-for="(value, key, index) in row.table_list"
                      :key="index"
                    >
                      {{ value.NewTableName }}
                    </li>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="" label="回档表名" width="width" >
                <template slot-scope=scope>
                  <li v-for="(value,key,index) in row.rollback_list" :key="index">{{value[0].TableName}}</li>
                </template>
            </el-table-column> -->
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            prop="instance"
            label="数据库实例"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop=""
            label="回档执行进度"
            width="width"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-progress :percentage="row.progress"></el-progress>
            </template>
          </el-table-column>
          <el-table-column
            prop="start_time"
            label="回档开始时间"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="stop_time"
            label="回档结束时间"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="status"
            label="回档状态"
            width="width"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-tag type="primary" v-if="row.status == 'RUNNING'"
                >进行中</el-tag
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
  name: "rollbackLog",
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      rollbackLogList: [],
      handleRollbackLogObj: {},
      handleRollbackLogList: [],
      total: 0,
      q: "",
    };
  },
  methods: {
    async getRollbackLog() {
      let result = await this.$API.databasesList.reqRollbackLog(
        this.pageSize,
        this.currentPage,
        this.$store.getters.id,
        this.q
      );
      this.rollbackLogList = result.data;
      this.total = result.count;
      console.log(this.rollbackLogList);
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getRollbackLog();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getRollbackLog();
    },
    handleExpandChange(row) {
      this.handleRollbackLogList = [];
      this.rollbackLogList.forEach((list) => {
        if (list.request_id == row.request_id) {
          this.handleRollbackLogObj = list;
          this.handleRollbackLogList.push(this.handleRollbackLogObj);
        }
      });
      console.log(row.request_id);
      console.log(this.handleRollbackLogObj);
    },
    handleSearch(){
      this.getRollbackLog()
    }
  },
  mounted() {
    this.getRollbackLog();
    console.log(this.$store.getters.id);
  },
};
</script>

<style>
</style>