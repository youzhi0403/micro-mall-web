<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.account" style="width: 200px;" placeholder="请输入账号" class="filter-item" @keyup.enter.native="listPage" />
      <el-date-picker
        v-model="listQuery.createTime"
        type="date"
        placeholder="请选择日期"
        class="filter-item"
        value-format="timestamp"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="listPage">
        搜索
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" align="center" width="80" type="index" />
      <el-table-column label="明细编号" align="center" prop="number" />
      <el-table-column label="明细类型" align="center" prop="type" />
      <el-table-column label="金额" align="center" prop="money" />
      <el-table-column label="类型名称" align="center" prop="typeName" />
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.createTime !== null">{{ transferTime(row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

  </div>
</template>

<script>
import { listPage } from '@/api/account-record'
import Pagination from '@/components/Pagination/index'
import { parseTime } from '@/utils'
export default {
  name: 'AccountRecord',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        account: null,
        createTime: null
      }
    }
  },
  created() {
    this.listPage()
  },
  methods: {
    listPage() {
      this.listLoading = true
      listPage(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    transferTime(date) {
      return parseTime(new Date(date), '{y}-{m}-{d} {h}:{i}:{s}')
    }
  }
}
</script>

<style scoped>

</style>
