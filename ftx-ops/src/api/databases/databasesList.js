import request from '@/utils/request'

// 获取数据库列表接口
export const reqDatabasesInstance = (pageSize, currentPage) => request({ url: `/v1/database_dev/?pageSize=${pageSize}&currentPage=${currentPage}`, method: 'get' })   //  pageSize=${pageSize}&currentPage=${currentPage}  /api/v1/database/${page}/${limit}

export const reqDatabasesList = (instance_id)=> request({url:`/v1/database_schemas/?instance_id=${instance_id}`,method:'get'})

export const reqTables = (instance_id,schema)=> request({url:`/v1/schema_tables/?instance_id=${instance_id}&schema=${schema}`,method:'get'})

export const reqRollback = (instanceId,strategy,rollbackTime,rollbackList)=>request({url:'/v1/rollback/',method:'post',instanceId,strategy,rollbackTime,rollbackList})