'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-hof/20">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-body font-medium whitespace-nowrap transition-all
                border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-rausch text-rausch'
                  : 'border-transparent text-foggy hover:text-hof hover:border-hof/30'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {currentTab?.content}
      </div>
    </div>
  )
}
