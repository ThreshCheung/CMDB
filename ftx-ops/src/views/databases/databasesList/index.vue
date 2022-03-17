<template>
  <div>
    <el-table style="width: 100%" border :data="data">
      <el-table-column prop="id" label="序号" width="80%" align="center">
      </el-table-column>
      <el-table-column prop="hostname" label="数据库名称" width="width">
      </el-table-column>
      <el-table-column prop="create_at" label="CreateTime" width="width">
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showDialog(row)"
            >回档</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 20px; text-align: center"
      :current-page="currentPage"
      :page-sizes="[10, 15, 20]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>

    <el-dialog title="提示" :visible.sync="dialogVisible">
      <template>
        <div class="block">
          <span class="demonstration">请确定回档时间</span>
          <el-date-picker
            v-model="value1"
            type="datetime"
            placeholder="选择日期时间"
            :picker-options="pickerOptions"
            style="margin-bottom: 20px; text-align: end"
          >
          </el-date-picker>
          <el-input placeholder="输入关键字进行过滤" v-model="filterText" clearable maxlength="2000">
          </el-input>
          <el-tree
            class="filter-tree"
            :data="dataTree"
            :props="defaultProps"
            :filter-node-method="filterNode"
            ref="tree"
            show-checkbox
          >
          </el-tree>
        </div>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "databasesList",
  data() {
    return {
      currentPage: 1,
      data: [],
      limit: 10,
      total: 0,
      dialogVisible: false,
      value1: "",
      value2: "",
      value3: "",
      dataTree: [],
      beginDate: "",
      defaultProps: {
        label: "name",
        children: "tables",
      },
      filterText: "",
      pickerOptions: {},
    };
  },
  methods: {
    async getDatabasesList() {
      let result = await this.$API.databasesList.reqDatabasesList(
        this.limit,
        this.currentPage
      );
      this.data = result.data;
      this.total = result.count;
      console.log(result);
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getDatabasesList();
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getDatabasesList();
    },
    showDialog(row) {
      this.dialogVisible = true;
      this.dataTree = row.databases;
      this.beginDate = row.rollback_begin;
      this.filterText = "";
      this.pickerOptions = {
        disabledDate: (time) => {
          return (
            time.getTime() > Date.now() ||
            time.getTime() < this.beginDateNodeDays
          );
        },
      };
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1
    },
    // loadNode(node, resolve) {
    //   if (node.level === 0) {
    //     return resolve(this.dataTree);
    //   }
    //   if (node.level > 1) return resolve([]);

    //   setTimeout(() => {
    //     const data = this.dataTree;

    //     resolve(data);
    //   }, 500);
    // },
  },
  computed: {
    beginDateNodeDays: {
      get: function () {
        let curDate = new Date().getTime();
        let beginDateNode = Date.parse(new Date(this.beginDate));
        let gapDate = curDate - beginDateNode;
        return curDate - gapDate;
      },
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  mounted() {
    this.getDatabasesList();
  },
};
</script>

<style>
</style>