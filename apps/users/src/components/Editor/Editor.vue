<template>
  <div ref="divRef" style="height: 500px" />
</template>

<script setup>
import { AiEditor } from "aieditor";
import "aieditor/dist/style.css"
import { onMounted, onUnmounted, ref, watch } from "vue"

// 使用 defineModel 定义双向绑定
const content = defineModel('content', {
  type: String,
  default: ''
})

const divRef = ref();
let aiEditor = null;

onMounted(() => {
  aiEditor = new AiEditor({
    element: divRef.value,
    placeholder: "点击输入内容...",
    content: content.value,
    contentRetention: false, // 默认不自动保存
    pasteAsText: true,// 纯文本粘贴
    textCounter: true, // 文本计数器
    draggable: false,// 禁用拖动
    toolbarExcludeKeys: [
      "heading",
      "font-family",
      "font-size",
      "brush",
      "printer",
      "code-block",
      "break",
      "video",
      "attachment",
      "subscript",
      "superscript",
      "container",
      "code",
      "source-code",
      "fullscreen",
      "table",
    ],
    // 监听内容变化，直接更新 content 值
    onChange: (aiEditor) => {
      content.value = aiEditor.getHtml();
    }
  })
})

// 监听外部传入的值变化
watch(() => content.value, (newValue) => {
  if (aiEditor && newValue !== aiEditor.getHtml()) {
    aiEditor.setContent(newValue);
  }
})

onUnmounted(() => {
  aiEditor && aiEditor.destroy();
})
</script>