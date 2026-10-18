import React from 'react';
import {Button, Result} from 'antd';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function NotFoundContent({className}) {
  const home = useBaseUrl('/');
  return (
    <Result
      className={className}
      status="404"
      title="404"
      subTitle="页面走丢了，可能是链接过期或者地址敲错了。"
      extra={
        <Button type="primary" href={home}>
          回到首页
        </Button>
      }
    />
  );
}
