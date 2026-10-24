import React from 'react'
import MDXComponents from '@theme-original/MDXComponents'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import Card from '@site/src/components/mdx/Card'
import Steps from '@site/src/components/mdx/Steps'

/**
 * 让所有 MDX 文档直接用这些组件，不用写 import：
 *   <Card>  内容卡片
 *   <Steps> 步骤条
 *   <Tabs>/<TabItem> 标签页（Docusaurus 自带）
 */
export default {
  ...MDXComponents,
  Card,
  Steps,
  Tabs,
  TabItem,
}
