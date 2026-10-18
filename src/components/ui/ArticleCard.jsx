import React from 'react';
import Link from '@docusaurus/Link';
import {Card, Flex, Tag, Typography} from 'antd';
import {CalendarOutlined} from '@ant-design/icons';
import {formatDate, readingTimeLabel} from '@site/src/utils/ui';

const {Text} = Typography;

// 通用文章卡片：标签 + 标题 + 摘要 + 日期/阅读时长
export default function ArticleCard({title, description, date, tags, readingTime, to, style}) {
  return (
    <Link to={to} style={{display: 'block', height: '100%'}}>
      <Card hoverable style={{height: '100%', borderRadius: 12, ...style}} styles={{body: {padding: 24}}}>
        <Flex vertical gap={10}>
          {tags?.length > 0 && (
            <Flex gap={8} wrap>
              {tags.slice(0, 2).map((tag) => (
                <Tag key={tag} bordered={false} color="blue">
                  {tag}
                </Tag>
              ))}
            </Flex>
          )}
          <Text strong style={{fontSize: 17, lineHeight: 1.4}}>
            {title}
          </Text>
          {description && (
            <Text type="secondary" style={{fontSize: 14, lineHeight: 1.7}}>
              {description}
            </Text>
          )}
          {(date || readingTime != null) && (
            <Text type="secondary" style={{fontSize: 12}}>
              {date && <><CalendarOutlined /> {formatDate(date)}</>}
              {readingTime != null && ` · ${readingTimeLabel(readingTime)}`}
            </Text>
          )}
        </Flex>
      </Card>
    </Link>
  );
}
