import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Empty, Input, List, Modal, Spin, Tag, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {useHistory} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {searchByWorker} from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker';

const {Text} = Typography;

export default function SearchBar() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const timer = useRef(null);

  const run = useCallback(
    async (value) => {
      if (!value.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const hits = await searchByWorker(baseUrl, '', value, 10);
        setResults(hits ?? []);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  const onChange = useCallback(
    (event) => {
      const value = event.target.value;
      setQuery(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => run(value), 220);
    },
    [run],
  );

  const goSearchPage = () => {
    setOpen(false);
    history.push(`${baseUrl}search/?q=${encodeURIComponent(query)}`);
  };

  const goto = (hit) => {
    setOpen(false);
    setQuery('');
    const url = `${hit.document.u}${hit.document.h ?? ''}`;
    history.push(url);
  };

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={<SearchOutlined />}
        style={{color: 'inherit'}}>
        搜索
        <Text type="secondary" style={{fontSize: 12, marginLeft: 8}}>
          Ctrl K
        </Text>
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={640}
        destroyOnHidden
        title={null}
        styles={{body: {paddingTop: 8}}}>
        <Input
          autoFocus
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="搜索文档…"
          value={query}
          onChange={onChange}
          onPressEnter={goSearchPage}
        />

        <div style={{marginTop: 16, minHeight: 160}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: 40}}>
              <Spin />
            </div>
          ) : results.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={query ? '没有找到结果' : '输入关键词开始搜索'}
            />
          ) : (
            <List
              size="small"
              dataSource={results}
              renderItem={(hit) => (
                <List.Item
                  style={{cursor: 'pointer'}}
                  onClick={() => goto(hit)}
                  extra={<Tag>{hit.type}</Tag>}>
                  <List.Item.Meta
                    title={
                      <Typography.Text ellipsis style={{maxWidth: 520}}>
                        {hit.document.t}
                      </Typography.Text>
                    }
                    description={
                      <Text type="secondary" style={{fontSize: 12}}>
                        {hit.page?.title ?? hit.document.u}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {results.length > 0 && (
          <div style={{textAlign: 'right', marginTop: 8}}>
            <Button type="link" onClick={goSearchPage}>
              查看全部结果 →
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
