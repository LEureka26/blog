<template>
  <div class="article-list">
    <div class="container">

      <div class="article-grid">
        <div class="article-card" v-for="article in articles" :key="article.id">
          <router-link :to="`/articles/${article.id}`" class="article-link">
            <div class="article-body">
              <h3 class="article-title">{{ article.title }}</h3>
              <div v-if="article.cover" class="article-cover">
                <img :src="article.cover" :alt="article.title">
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="article-category">{{ article.category }}</span>
                  <span class="article-views">浏览 {{ article.views || 0 }} 次</span>
                </div>
                <p class="article-excerpt">{{ truncateContent(article.content) }}</p>
                <div class="article-tags">
                  <span class="tag" v-for="tag in (article.tags ? JSON.parse(article.tags) : [])" :key="tag">#{{ tag }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="articles.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>

      <div class="pagination" v-if="articles.length > 0">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager ,next, jumper"
          :total="total"
          :prev-text="'上一页'"
          :next-text="'下一页'"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElPagination } from 'element-plus'
import { articleAPI } from '../utils/api'

const route = useRoute()
const articles = ref([])
const total = ref(0)
const pagination = ref({
  current: 1,
  size: 5
})

// 截断内容
const truncateContent = (content) => {
  if (!content) {
    return ''
  }
  const plainText = content.replace(/[\r\n]+/g, ' ').replace(/[\s]+/g, ' ')
  if (plainText.length > 150) {
    return plainText.substring(0, 150) + '...'
  }
  return plainText
}

// 加载文章列表
const loadArticles = async () => {
  try {
    const search = route.query.search || ''
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.size,
      search: search
    }
    const response = await articleAPI.getArticles(params)
    // 处理后端返回的数据格式
    if (response.data && Array.isArray(response.data)) {
      // 如果 response.data 是一个数组，直接使用它
      articles.value = response.data
      total.value = response.total || 0
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
      // 如果 response.data 是一个对象，并且它有一个 data 属性，使用 response.data.data
      articles.value = response.data.data
      total.value = response.data.total || 0
    } else {
      // 否则，使用一个空数组
      articles.value = []
      total.value = 0
    }
  } catch (error) {
    // console.error('获取文章列表失败:', error)
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  loadArticles()
}

// 处理页码变化
const handleCurrentChange = (current) => {
  pagination.value.current = current
  loadArticles()
}

// 监听路由变化
watch(() => route.query, () => {
  loadArticles()
}, { immediate: false })

// 初始化
onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.article-list {
  width: 90vw;
  max-width: 950px;
  margin: 30px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 100%;
  margin: 20px auto 0px;
  padding: 0 15px;
}

.article-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  justify-items: center;
}

.article-card {
  width: 90%;
  max-width: 650px;
  min-width: 280px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.article-link {
  display: block;
  text-decoration: none;
  color: #333;
}

.article-body {
  padding: 20px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.article-card:hover .article-title {
  color: #409eff;
}

.article-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 0;
  border-radius: 15px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  width: 100%;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 12px;
  color: #999;
  padding: 0px 5px;
}

.article-category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.article-excerpt {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  padding: 0px 30px;
  text-indent: 2em;
  line-height: 1.6em;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0px 5px;
}

.tag {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
.pagination :deep(.el-pagination__total){
font-size: 14px;
}
.pagination :deep(.el-select__placeholder span){
color: #101010;
}
.pagination :deep(.el-pagination__goto){
font-size: 14px;
color: #131313;
}
.pagination :deep(.el-pagination) {
  color: #000000;
}

.pagination :deep(.el-pagination__total) {
  color: #000000;
}

.pagination :deep(.el-pagination .el-input__inner) {
  background: rgba(255, 255, 255, 0.3);
  color: #000000;
}
.pagination :deep(.el-select__wrapper){
  background-color: rgba(255, 255, 255, 0.7);
   color: #000000;
}
.pagination :deep( .el-input__wrapper){
  background-color: rgba(255, 255, 255, 0.7);

}
.pagination :deep( .el-pagination .btn-prev){
  background-color: rgba(255, 255, 255, 0.7);
}
.pagination :deep( .el-pager li.is-active){
  background-color: rgba(255, 255, 255, 0.7);

}
.pagination :deep( .el-pager li){
  background-color: rgba(255, 255, 255, 0.7);

}
.pagination :deep( .el-pagination .btn-next){
  background-color: rgba(255, 255, 255, 0.7);

}

/* 保持平板布局尺寸，不随窗口缩放改变 */
  
  .tag {
    font-size: 10px;
    padding: 1px 6px;
  }
  
  .empty-state {
    padding: 60px 0;
  }
  
  .pagination {
    margin-top: 20px;
  }
  
  .el-pagination {
    font-size: 12px;
  }
  
  .el-pagination__sizes {
    display: none;
  }
  
  .el-pagination__total {
    font-size: 12px;
  }

</style>