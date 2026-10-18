import React from 'react';
import {Button, Flex} from 'antd';
import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

export default function DocPaginator({previous, next}) {
  if (!previous && !next) {
    return null;
  }
  return (
    <Flex
      justify="space-between"
      gap={16}
      wrap
      style={{
        marginTop: 48,
        paddingTop: 24,
        borderTop: '1px solid var(--ant-color-border)',
      }}>
      {previous ? (
        <Button
          size="large"
          href={previous.permalink}
          icon={<ArrowLeftOutlined />}
          style={{minWidth: 240, justifyContent: 'flex-start'}}>
          上一篇：{previous.title}
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button
          size="large"
          type="primary"
          ghost
          href={next.permalink}
          style={{minWidth: 240, justifyContent: 'flex-end'}}>
          下一篇：{next.title} <ArrowRightOutlined />
        </Button>
      ) : (
        <span />
      )}
    </Flex>
  );
}
