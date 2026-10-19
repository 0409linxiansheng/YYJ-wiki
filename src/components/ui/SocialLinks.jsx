import React, {useCallback, useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {Button, Modal, Tooltip, Typography} from 'antd';
import {GithubOutlined, QqOutlined, WechatOutlined} from '@ant-design/icons';

const {Text} = Typography;

function QrModal({open, onClose, title, src, path}) {
  const [failed, setFailed] = useState(false);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={340}
      centered
      title={title}
      destroyOnHidden>
      <div style={{textAlign: 'center', padding: '4px 0 12px'}}>
        {failed ? (
          <div
            style={{
              width: 240,
              height: 240,
              margin: '0 auto',
              border: '1px dashed var(--line)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-fg)',
              fontSize: 13,
              padding: 16,
            }}>
            <span>二维码待添加</span>
            <Text code style={{fontSize: 11}}>
              {path}
            </Text>
          </div>
        ) : (
          <img
            src={src}
            alt={`${title}二维码`}
            width={240}
            height={240}
            style={{objectFit: 'contain', display: 'block', margin: '0 auto'}}
            onError={() => setFailed(true)}
          />
        )}
        <Text type="secondary" style={{display: 'block', marginTop: 12, fontSize: 13}}>
          扫码添加
        </Text>
      </div>
    </Modal>
  );
}

export default function SocialLinks({className}) {
  const {siteConfig} = useDocusaurusContext();
  const fields = siteConfig.customFields ?? {};
  const [open, setOpen] = useState(null);

  const github = fields.github ?? 'https://github.com/YYJ-lin/YYJ-wiki';
  const wechatQr = useBaseUrl(fields.wechatQr ?? '/img/wechat-qr.webp');
  const qqQr = useBaseUrl(fields.qqQr ?? '/img/qq-qr.webp');

  // 预加载二维码：空闲时后台拉取，鼠标悬停时立刻拉取，点击时基本秒开
  const prefetch = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    [wechatQr, qqQr].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [wechatQr, qqQr]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, {timeout: 4000});
      return () => window.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(prefetch, 2500);
    return () => window.clearTimeout(timer);
  }, [prefetch]);

  return (
    <>
      <Tooltip title="GitHub">
        <Button
          type="text"
          className={className}
          icon={<GithubOutlined />}
          href={github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        />
      </Tooltip>
      <Tooltip title="微信">
        <Button
          type="text"
          className={className}
          icon={<WechatOutlined />}
          onClick={() => setOpen('wechat')}
          onMouseEnter={prefetch}
          aria-label="微信"
        />
      </Tooltip>
      <Tooltip title="QQ">
        <Button
          type="text"
          className={className}
          icon={<QqOutlined />}
          onClick={() => setOpen('qq')}
          onMouseEnter={prefetch}
          aria-label="QQ"
        />
      </Tooltip>

      <QrModal
        open={open === 'wechat'}
        onClose={() => setOpen(null)}
        title="微信"
        src={wechatQr}
        path={fields.wechatQr ?? '/img/wechat-qr.webp'}
      />
      <QrModal
        open={open === 'qq'}
        onClose={() => setOpen(null)}
        title="QQ"
        src={qqQr}
        path={fields.qqQr ?? '/img/qq-qr.webp'}
      />
    </>
  );
}
