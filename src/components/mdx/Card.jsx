import React from 'react'

/**
 * 内容卡片：左图右文，标题可点。
 * 用法（MDX）：
 *   <Card title="从零装一个 WordPress" href="/kb/wordpress/install" image="/img/wp.png">
 *     一句话说明这篇讲什么。
 *   </Card>
 */
export default function Card({ title, href, image, children }) {
  const Title = href ? (
    <a href={href} className="yyj-card-title">
      {title}
    </a>
  ) : (
    <span className="yyj-card-title">{title}</span>
  )

  return (
    <div className={`yyj-card${image ? ' has-image' : ''}`}>
      {image ? <img className="yyj-card-image" src={image} alt="" /> : null}
      <div className="yyj-card-body">
        {title ? Title : null}
        {children ? <div className="yyj-card-desc">{children}</div> : null}
      </div>
    </div>
  )
}
