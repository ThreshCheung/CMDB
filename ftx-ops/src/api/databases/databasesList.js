import request from '@/utils/request'

// 获取数据库列表接口
export const reqDatabasesList = (pageSize, currentPage) => request({ url: `/v1/database/?pageSize=${pageSize}&currentPage=${currentPage}`, method: 'get' })   //  pageSize=${pageSize}&currentPage=${currentPage}  /api/v1/database/${page}/${limit}

