<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="deleteBatch">
        删除
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="序号" align="center" width="80" type="index" />
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="描述" align="center" prop="description" />
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
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="{row}">
          <span v-if="row.type === 1">目录</span>
          <span v-if="row.type === 2">菜单</span>
          <span v-if="row.type === 3">功能</span>
        </template>
      </el-table-column>
      <el-table-column label="权限值" align="center" prop="value" />
      <el-table-column label="前端资源路径" align="center" prop="uri" />
      <el-table-column label="图标" align="center" prop="icon">
        <template slot-scope="{row}">
          <i :class="row.icon" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader
            v-model="temp.parentIds"
            :options="permissionTreeList"
            :props="{label:'name',value:'id'}"
            change-on-select
            class="my-cascader"
          />
        </el-form-item>

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="temp.description" placeholder="请输入权限描述" />
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择权限类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="权限值" prop="value">
          <el-input v-model="temp.value" placeholder="请输入权限值" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="temp.icon" placeholder="请输入图标" />
        </el-form-item>

        <el-form-item label="前端资源路径" prop="uri">
          <el-input v-model="temp.uri" placeholder="请输入前端资源路径" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="请输入排序" />
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
import { treeList, add, update, deleteBatch, listPage, detail } from '@/api/permission'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'Permission',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑权限',
        add: '新增权限'
      },
      temp: {
        id: undefined,
        parentId: '',
        name: '',
        description: '',
        type: '',
        value: '',
        icon: '',
        uri: '',
        sort: '',
        parentIds: []
      },
      rules: {
        name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择权限类型', trigger: 'blur' }],
        value: [{ required: true, message: '请输入权限值', trigger: 'blur' }]
      },
      multipleSelection: [],
      permissionTreeList: [],
      typeOptions: [
        {
          id: '1',
          label: '目录'
        },
        {
          id: '2',
          label: '菜单'
        },
        {
          id: '3',
          label: '功能'
        }
      ]
    }
  },
  created() {
    this.listPage()
    this.treeList()
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
        name: '',
        description: '',
        type: '',
        value: '',
        icon: '',
        uri: '',
        sort: ''
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
    deleteBatch() {
      if (this.multipleSelection.length < 1) {
        this.$message.warning('请至少选择一行数据')
        return
      } else {
        const params = { ids: [] }
        this.multipleSelection.forEach(item => {
          params.ids.push(item.id)
        })
        this.$confirm('确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBatch(params).then((res) => {
            this.tip(res)
            this.listPage()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    transferTime(date) {
      return parseTime(new Date(date), '{y}-{m}-{d} {h}:{i}:{s}')
    },
    treeList() {
      treeList().then((response) => {
        this.permissionTreeList = response.data
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
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
    }
  }
}
</script>

<style scoped>
.el-cascader.my-cascader{
  width: 100%;
}
</style>
