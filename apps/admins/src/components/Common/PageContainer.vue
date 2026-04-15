<script setup>
const props = defineProps({
	title: {
		required: true,
		type: String,
	},
});
</script>

<template>
	<section class="page-container">
		<!-- 具名插槽定义按钮 -->
		<!-- 头部 -->
		<div class="header">
			<h1 class="title">{{ props.title }}</h1>
			<div class="extra">
				<!-- 额外的按钮 -->
				<slot name="extra"></slot>
			</div>
		</div>
		<!-- 页面内容,默认插槽 -->
		<slot name="content"></slot>
	</section>
</template>

<style lang="scss" scoped>
.page-container {
	min-height: 100%;
	box-sizing: border-box;

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #000;
		padding: 16px 0;
		border-bottom: 1px solid #f0f0f0;
		margin-bottom: 24px;

		.title {
			font-size: 28px;
			font-weight: 600;
			color: #1a1a1a;
			margin: 0;
			line-height: 1.2;
			letter-spacing: -0.02em;
		}
	}
}
</style>
