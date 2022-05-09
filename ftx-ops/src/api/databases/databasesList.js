import request from '@/utils/request'

// 获取数据库列表接口
export const reqDatabasesInstance = (pageSize, currentPage,envID,q) => request({ url: `/v1/database_dev/?pageSize=${pageSize}&currentPage=${currentPage}&envID=${envID}&q=${q}`, method: 'get' })   //  pageSize=${pageSize}&currentPage=${currentPage}  /api/v1/database/${page}/${limit}

export const reqDatabasesList = (instance_id)=> request({url:`/v1/database_schemas/?instance_id=${instance_id}`,method:'get'})

export const reqTables = (instance_id,schema)=> request({url:`/v1/schema_tables/?instance_id=${instance_id}&schema=${schema}`,method:'get'})

export const reqRollback = (data)=>request({url:'/v1/rollback/',method:'post',data})

export const reqRollbackLog = (pageSize, currentPage,envID,q) => request({ url: `/v1/rollback_log/?pageSize=${pageSize}&currentPage=${currentPage}&envID=${envID}&q=${q}`, method: 'get' })

export const reqSlowLogList = (instance_id, start_time,stop_time,q) => request({ url: `/v1/slowlog/?instance_id=${instance_id}&start_time=${start_time}&stop_time=${stop_time}&q=${q}`, method: 'get' })