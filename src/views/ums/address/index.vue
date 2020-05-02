<template>
  <div class="app-container">
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
      <el-table-column label="地址收件人名称" align="center" prop="name" />
      <el-table-column label="手机号码" align="center" prop="telephone" />
      <el-table-column label="具体地址" align="center" prop="addressInfo" />
      <el-table-column label="是否为默认地址" align="center">
        <template slot-scope="{row}">
          <span v-if="row.isDefault === 1">默认</span>
          <span v-if="row.isDefault === 2">非默认</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.createTime !== null">{{ transferTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updateTime !== null">{{ transferTime(row.updateTime) }}</span>
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
  name: 'Address',
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
