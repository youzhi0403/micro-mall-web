<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="请输入分类名称" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-select v-model="listQuery.kind" placeholder="请选择分类类型" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in kindOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="listPage">
        搜索
      </el-button>
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
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="层级" align="center" prop="level" />
      <el-table-column label="分类类型" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.kind == 0">正常分类</span>
          <span v-if="row.kind == 1">身体部位分类</span>
          <span v-if="row.kind == 2">科室分类</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.createTime !== null">{{ transferTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updateTime !== null">{{ transferTime(row.updateTime ) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click.stop.prevent="del(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类类型" prop="kind">
          <el-select v-model="temp.kind" placeholder="请选择分类类型" @change="selectKind">
            <el-option
              v-for="item in kindOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId">
          <el-cascader
            v-model="temp.parentIds"
            :options="classificationTreeList"
            :props="{label:'name',value:'id'}"
            change-on-select
            class="my-cascader"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入分类名称" />
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='add'?add():update()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import { add, del, listPage, update, detail, treeList } from '@/api/classification'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'Classification',
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
        keyword: null,
        kind: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑分类',
        add: '新增分类'
      },
      temp: {
        id: undefined,
        parentId: '',
        parentIds: [],
        kind: '',
        name: ''
      },
      classificationTreeList: [],
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        kind: [{ required: true, message: '请输入分类类型', trigger: 'blur' }]
      },
      kindOptions: [
        {
          id: 0,
          label: '正常分类'
        },
        {
          id: 1,
          label: '身体部位分类'
        },
        {
          id: 2,
          label: '科室分类'
        }
      ]
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
    resetTemp() {
      this.temp = {
        id: undefined,
        parentId: '',
        parentIds: [],
        name: '',
        kind: ''
      }
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
      if (this.temp.parentIds.length > 0) {
        this.temp.parentId = this.temp.parentIds.pop()
      } else {
        this.temp.parentId = 0
      }
      delete this.temp.parentIds
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
    handleUpdate(row) {
      detail(row.id).then(response => {
        this.temp = response.data
      })
      this.treeList(row.kind)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    update() {
      if (this.temp.parentIds.length > 0) {
        this.temp.parentId = this.temp.parentIds.pop()
      } else {
        this.temp.parentId = 0
      }
      delete this.temp.parentIds
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          update(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.listPage()
          })
        }
      })
    },
    del(row) {
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
    transferTime(date) {
      return parseTime(new Date(date), '{y}-{m}-{d} {h}:{i}:{s}')
    },
    tip(res) {
      if (res.code === 200) {
        this.$message({
          message: res.message,
          type: 'success'
        })
      } else {
        this.$message.error(res.message)
      }
    },
    treeList(kind) {
      treeList(kind).then(response => {
        this.classificationTreeList = response.data
      })
    },
    selectKind(val) {
      this.treeList(val)
    }
  }
}
</script>

<style scoped>
  .el-cascader.my-cascader{
    width: 100%;
  }
</style>
