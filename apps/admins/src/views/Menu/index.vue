<script setup>
import { HomeFilled, Document, Avatar, Folder } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

// 计算当前激活的菜单项
const activeMenu = computed(() => {
	return route.path;
});
</script>

<template>
	<div class="fixed-layout">
		<!-- 左侧菜单（固定） -->
		<el-aside class="fixed-aside">
			<el-menu class="el-menu-vertical-demo" router :default-active="activeMenu">
				<div class="title">
					<div class="logo">
						<div class="paw-icon">🐾</div>
					</div>
				</div>
				<div class="menu-section">
					<el-menu-item index="/admin/home">
						<el-icon>
							<HomeFilled />
						</el-icon>
						<span>后台首页</span>
					</el-menu-item>

					<el-menu-item index="/admin/article">
						<el-icon>
							<Document />
						</el-icon>
						<span>帖子管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/comment">
						<el-icon>
							<Document />
						</el-icon>
						<span>评论管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/notice">
						<el-icon>
							<Document />
						</el-icon>
						<span>通知管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/user">
						<el-icon>
							<Avatar />
						</el-icon>
						<span>用户管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/pet">
						<el-icon>
							<Avatar />
						</el-icon>
						<span>宠物管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/adopt">
						<el-icon>
							<Document />
						</el-icon>
						<span>领养管理</span>
					</el-menu-item>
					<el-menu-item index="/admin/adopt-applications">
						<el-icon>
							<Document />
						</el-icon>
						<span>领养申请</span>
					</el-menu-item>
					<el-menu-item index="/admin/service">
						<el-icon>
							<Avatar />
						</el-icon>
						<span>服务管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/reserve">
						<el-icon>
							<Document />
						</el-icon>
						<span>预约管理</span>
					</el-menu-item>

					<el-menu-item index="/admin/person">
						<el-icon>
							<Avatar />
						</el-icon>
						<span>个人信息</span>
					</el-menu-item>
				</div>
			</el-menu>
		</el-aside>

		<!-- 右侧主内容区 -->
		<div class="main-content">
			<!-- 顶部导航栏（固定） -->
			<el-header class="fixed-header">
				<span class="header-left-content">
					欢迎登录
				</span>
				<div class="header-right-content">
					<el-avatar :size="35" :src="avatarUrl">
						<el-icon>
							<Avatar />
						</el-icon>
					</el-avatar>
					<el-dropdown>
						<span class="el-dropdown-link">设置</span>
						<template #dropdown>
							<el-dropdown-menu>
								<!-- 跳转到管理员个人信息 -->
								<el-dropdown-item @click="() => router.push('/admin/adminperson')">设置账号</el-dropdown-item>
								<el-dropdown-item @click="Loginout">退出登录</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</el-header>

			<!-- 内容区（允许内部滚动） -->
			<el-main class="scrollable-content">
				<router-view></router-view>
			</el-main>
		</div>
	</div>
</template>

<style lang="scss" scoped>
/* 全局禁用滚动 */
body {
	overflow: hidden;
}

.fixed-layout {
	display: flex;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
}

/* 左侧菜单栏（固定） */
.fixed-aside {
	width: 250px;
	height: 100vh;
	background-color: #ffffff;
	position: fixed;
	left: 0;
	top: 0;
	z-index: 1000;
	border-right: 1px solid #e5e7eb;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
	/* 隐藏滚动条但保持滚动功能 */
	overflow-y: auto;
	scrollbar-width: none;
	/* Firefox */
	-ms-overflow-style: none;
	/* IE and Edge */

	/* 隐藏 Webkit 浏览器的滚动条 */
	&::-webkit-scrollbar {
		display: none;
	}

	.el-menu {
		height: auto;
		min-height: 100%;
		border-right: none;
		background-color: #ffffff;
		padding: 0;
		padding-bottom: 20px;
		/* 底部留出一些空间 */

		.title {
			padding: 24px 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-bottom: 1px solid #f3f4f6;
			font-size: 40px;
			font-weight: 600;
			margin-bottom: 16px;
			/* 固定标题位置 */
			position: sticky;
			top: 0;
			background-color: #ffffff;
			z-index: 10;

			.logo {
				display: flex;
				align-items: center;
				gap: 12px;

				.paw-icon {
					font-size: 28px;
					color: #6b7280;
				}
			}
		}

		.menu-section {
			padding: 0 16px;

			.section-title {
				font-size: 11px;
				font-weight: 600;
				color: #9ca3af;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				padding: 8px 12px;
				margin-bottom: 8px;
				/* 固定分组标题位置 */
				position: sticky;
				top: 80px;
				/* 标题高度 + 一些间距 */
				background-color: #ffffff;
				z-index: 9;
			}
		}

		.el-menu-item {
			color: #6b7280;
			height: 44px;
			line-height: 44px;
			margin: 2px 0;
			border-radius: 8px;
			transition: all 0.2s ease;
			font-size: 14px;
			font-weight: 500;
			padding-left: 12px;

			.el-icon {
				margin-right: 12px;
				font-size: 18px;
				color: #9ca3af;
			}

			&:hover {
				background-color: #f9fafb;
				color: #374151;

				.el-icon {
					color: #6b7280;
				}
			}

			&.is-active {
				background-color: #eff6ff;
				color: #8470FF;
				font-weight: 600;
				border-left: 3px solid #8470FF;

				.el-icon {
					color: #8470FF;
				}
			}
		}
	}
}

/* 右侧主内容区 */
.main-content {
	margin-left: 250px;
	/* 避免被左侧菜单栏遮挡 */
	width: calc(100vw - 250px);
	height: 100vh;
	overflow: hidden;
}

/* 顶部导航栏（固定） */
.fixed-header {
	position: fixed;
	top: 0;
	right: 0;
	left: 250px;
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	background-color: #ffffff;
	color: #374151;
	z-index: 999;
	border-bottom: 1px solid #e5e7eb;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

	.header-left-content {
		font-size: 14px;
		color: #6b7280;
	}

	.header-right-content {
		display: flex;
		align-items: center;
		gap: 16px;

		.el-dropdown-link {
			color: #374151;
			font-weight: 500;
			cursor: pointer;
			transition: color 0.2s ease;

			&:hover {
				color: #2563eb;
			}
		}
	}
}

/* 内容区（允许内部滚动） */
.scrollable-content {
	margin-top: 64px;
	/* 避免被头部遮挡 */
	padding: 24px;
	height: calc(100vh - 64px);
	overflow-y: auto;
	background-color: #f9fafb;
}

/* 移除原有的深色主题样式 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
	background-color: #f9fafb !important;
	color: #374151 !important;
}

:deep(.el-sub-menu__title) {
	color: #6b7280;
}

:deep(.el-menu--inline) {
	background-color: #ffffff;
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
	width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
	background: #f1f5f9;
}

.scrollable-content::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
	background: #94a3b8;
}
</style>