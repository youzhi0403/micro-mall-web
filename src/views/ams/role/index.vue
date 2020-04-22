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
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdatePermission(row)">
            设置权限
          </el-button>
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="temp.description" placeholder="请输入角色描述" />
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

    <el-dialog title="设置角色权限" :visible.sync="dialogPermissionVisible">
      <el-form ref="permissionForm" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="权限设置">
          <div class="el-form-item-tree">
            <el-tree
              ref="tree"
              :data="permissionTreeList"
              show-checkbox
              node-key="id"
              :default-expand-all="true"
              :props="treeProps"
            />
          </div>

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPermissionVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="setPermissions">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { add, update, deleteBatch, listPage, getPermissions, setPermissions } from '@/api/role'
import { treeList } from '@/api/permission'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'Role',
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
        update: '编辑角色',
        add: '创建角色'
      },
      temp: {
        id: undefined,
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      dialogPermissionVisible: false,
      tempPermissions: {
        roleId: undefined,
        permissionIds: []
      },
      permissionTreeList: [],
      treeProps: {
        label: 'name'
      },
      multipleSelection: []
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
        name: '',
        description: ''
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
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    update() {
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
    setPermissions() {
      this.tempPermissions.permissionIds = []
      this.$refs.tree.getCheckedNodes().forEach(item => {
        this.tempPermissions.permissionIds.push(item.id)
      })
      setPermissions(this.tempPermissions).then(response => {
        this.tip(response)
        this.dialogPermissionVisible = false
        this.listPage()
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleUpdatePermission(row) {
      this.dialogPermissionVisible = true
      this.tempPermissions.roleId = row.id
      getPermissions(row.id).then(response => {
        this.$refs.tree.setCheckedNodes(response.data)
      })
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
.el-form-item-tree{
  height: 200px;
  overflow-y: scroll;
  width: 500px;
}
</style>
