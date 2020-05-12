<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="temp.type" placeholder="请选择优惠券类型">
        <el-option
          v-for="item in typeOptions"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>

      <el-select v-model="temp.useType" placeholder="请选择优惠券类型">
        <el-option
          v-for="item in useTypeOptions"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>

      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
        新增
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
      <el-table-column label="优惠券类型" align="center" prop="useType" width="100">
        <template slot-scope="{row}">
          <span v-if="row.useType == 0">全场通用</span>
          <span v-if="row.useType == 1">指定分类</span>
          <span v-if="row.useType == 2">指定商品</span>
          <span v-if="row.useType == 3">邮费券</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券开始时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.startTime !== null">{{ transferTime(row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券结束时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.endTime !== null">{{ transferTime(row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券内容" align="center" prop="content" width="200" />
      <el-table-column label="优惠券金额" align="center" prop="money" width="100" />
      <el-table-column label="优惠券满减金额" align="center" prop="fullReductionMoney" width="150" />
      <el-table-column label="使用平台" align="center" prop="platform">
        <template slot-scope="{row}">
          <span v-if="row.platform == 0">全部</span>
          <span v-if="row.platform == 1">移动端</span>
          <span v-if="row.platform == 2">PC端</span>
        </template>
      </el-table-column>
      <el-table-column label="每人限领张数" align="center" prop="perLimit" width="120" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="可领取时间" width="160" align="center">
        <template slot-scope="{row}">
          <span v-if="row.enableTime !== null">{{ transferTime(row.enableTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券类型" align="center" prop="type" width="100">
        <template slot-scope="{row}">
          <span v-if="row.platform == 0">全场赠券</span>
          <span v-if="row.platform == 1">会员赠券</span>
          <span v-if="row.platform == 2">购物赠券</span>
          <span v-if="row.platform == 3">注册赠券</span>
        </template>
      </el-table-column>
      <el-table-column label="发行数量" align="center" prop="publishCount" />
      <el-table-column label="已使用数量" align="center" prop="useCount" width="100" />
      <el-table-column label="领取数量" align="center" prop="receiveCount" />
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="alert('待开发')">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click.stop.prevent="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="优惠券类型" prop="useType">
          <el-select v-model="temp.useType" placeholder="请选择优惠券类型">
            <el-option
              v-for="item in useTypeOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择优惠券类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优惠券内容" prop="content">
          <el-input v-model="temp.content" placeholder="请输入优惠券内容" />
        </el-form-item>

        <el-form-item label="优惠券开始时间" prop="startTime">
          <el-date-picker
            v-model="temp.startTime"
            type="date"
            placeholder="请选择优惠券开始日期"
          />
        </el-form-item>

        <el-form-item label="优惠券结束时间" prop="endTime">
          <el-date-picker
            v-model="temp.endTime"
            type="date"
            placeholder="请选择优惠券结束日期"
          />
        </el-form-item>

        <el-form-item label="优惠券金额" prop="money">
          <el-input v-model="temp.money" placeholder="请输入优惠券金额" type="number" />
        </el-form-item>

        <el-form-item label="优惠券满减金额" prop="fullReductionMoney">
          <el-input v-model="temp.fullReductionMoney" placeholder="请输入优惠券满减金额" type="number" />
        </el-form-item>

        <el-form-item label="使用平台" prop="platform">
          <el-select v-model="temp.platform" placeholder="请选择使用平台">
            <el-option
              v-for="item in platformOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="每人限领张数" prop="perLimit">
          <el-input v-model="temp.perLimit" placeholder="请输入每人限领张数" type="number" />
        </el-form-item>

        <el-form-item label="可领取日期" prop="enableTime">
          <el-date-picker
            v-model="temp.enableTime"
            type="date"
            placeholder="请选择可领取日期"
          />
        </el-form-item>

        <el-form-item label="发行数量" prop="publishCount">
          <el-input v-model="temp.publishCount" placeholder="请输入发行数量" type="number" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="add">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPage, add, del } from '@/api/coupons'
import Pagination from '@/components/Pagination/index'
import { parseTime } from '@/utils'
export default {
  name: 'Coupons',
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
        type: null,
        useType: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        add: '创建优惠券'
      },
      temp: {
        useType: null,
        type: null,
        content: '',
        startTime: null,
        endTime: null,
        money: null,
        fullReductionMoney: null,
        platform: null,
        perLimit: null,
        remark: null,
        enableTime: null,
        publishCount: null
      },
      typeOptions: [
        {
          id: 0,
          label: '全场赠券'
        },
        {
          id: 1,
          label: '会员赠券'
        },
        {
          id: 2,
          label: '购物赠券'
        },
        {
          id: 3,
          label: '注册赠券'
        }
      ],
      useTypeOptions: [
        {
          id: 0,
          label: '全场通用'
        },
        {
          id: 1,
          label: '指定分类'
        },
        {
          id: 2,
          label: '指定商品'
        },
        {
          id: 3,
          label: '邮费券'
        }
      ],
      platformOptions: [
        {
          id: 0,
          label: '全部'
        },
        {
          id: 1,
          label: '移动'
        },
        {
          id: 2,
          label: 'PC'
        }
      ],
      rules: {

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
    handleAdd() {
      this.resetTemp()
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    add() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          add(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.listPage()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(row.id).then((res) => {
          this.tip(res)
          this.listPage()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleClose(done) {
      this.resetTemp()
      done()
    },
    resetTemp() {
      this.temp = {
        useType: null,
        type: null,
        content: '',
        startTime: null,
        endTime: null,
        money: null,
        fullReductionMoney: null,
        platform: null,
        perLimit: null,
        remark: null,
        enableTime: null,
        publishCount: null
      }
    },
    transferTime(date) {
      return parseTime(new Date(date), '{y}-{m}-{d} {h}:{i}:{s}')
    }
  }
}
</script>

<style scoped>

</style>
