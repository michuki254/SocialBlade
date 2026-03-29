'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components'
import { getVideoById, searchVideos } from '@/services/youtube'
import { extractVideoId, formatNumber } from '@/lib/youtube-utils'
import {
  calculateSEOScore,
  analyzeTitleSEO,
  analyzeDescriptionSEO,
  analyzeTagsSEO,
  extractKeywords,
  analyzeTagOverlap,
  generateSEORecommendations,
} from '@/lib/seo-analyzer'
import type { FormattedVideoData } from '@/types/youtube'
import Image from 'next/image'

type Tool = 'analyze' | 'keyword' | 'tags'

export default function SEOToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>('analyze')
  const [videoInput, setVideoInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [video, setVideo] = useState<FormattedVideoData | null>(null)
  const [searchResults, setSearchResults] = useState<FormattedVideoData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzeVideo = async () => {
    if (!videoInput.trim()) {
      setError('Please enter a video URL or ID')
      return
    }

    setLoading(true)
    setError(null)
    setVideo(null)

    try {
      const videoId = extractVideoId(videoInput)
      if (!videoId) {
        setError('Invalid video URL or ID')
        setLoading(false)
        return
      }

      const videoData = await getVideoById(videoId)
      if (!videoData) {
        setError('Video not found')
        setLoading(false)
        return
      }

      setVideo(videoData)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch video')
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordSearch = async () => {
    if (!keywordInput.trim()) {
      setError('Please enter a keyword to search')
      return
    }

    setLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const results = await searchVideos(keywordInput, 10)
      if (results.items.length === 0) {
        setError('No videos found for this keyword')
        setLoading(false)
        return
      }

      // Fetch full details for each video
      const videoIds = results.items
        .map(item => item.id.videoId)
        .filter(id => id)

      const videoDetails = await Promise.all(
        videoIds.map(id => getVideoById(id!))
      )

      setSearchResults(videoDetails.filter((v): v is FormattedVideoData => v !== null))
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to search videos')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  // SEO Analysis data
  const seoScore = video ? calculateSEOScore(video) : null
  const titleAnalysis = video ? analyzeTitleSEO(video.title) : null
  const descAnalysis = video ? analyzeDescriptionSEO(video.description) : null
  const tagsAnalysis = video ? analyzeTagsSEO(video.tags || []) : null
  const recommendations = video ? generateSEORecommendations(video) : []
  const keywords = video ? extractKeywords(video.title + ' ' + video.description) : []

  // Tag overlap analysis
  const competitorTags = searchResults.map(v => v.tags || [])
  const tagOverlap = video && searchResults.length > 0
    ? analyzeTagOverlap(video.tags || [], competitorTags)
    : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            SEO Tools
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Optimize your YouTube content for search and discovery with powerful SEO analysis tools.
          </p>

          {/* Tool Selector */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTool('analyze')}
              className={`px-6 py-2 rounded-standard font-medium transition-all ${
                activeTool === 'analyze'
                  ? 'bg-white text-rausch'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              suppressHydrationWarning
            >
              Video SEO Analyzer
            </button>
            <button
              onClick={() => setActiveTool('keyword')}
              className={`px-6 py-2 rounded-standard font-medium transition-all ${
                activeTool === 'keyword'
                  ? 'bg-white text-rausch'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              suppressHydrationWarning
            >
              Keyword Research
            </button>
            <button
              onClick={() => setActiveTool('tags')}
              className={`px-6 py-2 rounded-standard font-medium transition-all ${
                activeTool === 'tags'
                  ? 'bg-white text-rausch'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              suppressHydrationWarning
            >
              Tag Optimizer
            </button>
          </div>

          {/* Video SEO Analyzer Input */}
          {activeTool === 'analyze' && (
            <div className="flex gap-4 max-w-3xl">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter video URL or ID to analyze SEO..."
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAnalyzeVideo)}
                  className="bg-white"
                />
              </div>
              <Button onClick={handleAnalyzeVideo} size="large" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze SEO'}
              </Button>
            </div>
          )}

          {/* Keyword Research Input */}
          {activeTool === 'keyword' && (
            <div className="flex gap-4 max-w-3xl">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter keyword to research (e.g., 'javascript tutorial')..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleKeywordSearch)}
                  className="bg-white"
                />
              </div>
              <Button onClick={handleKeywordSearch} size="large" disabled={loading}>
                {loading ? 'Searching...' : 'Research'}
              </Button>
            </div>
          )}

          {/* Tag Optimizer Input */}
          {activeTool === 'tags' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter your video URL or ID..."
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleAnalyzeVideo)}
                    className="bg-white"
                  />
                </div>
                <Button onClick={handleAnalyzeVideo} size="large" disabled={loading}>
                  Analyze
                </Button>
              </div>
              {video && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter keyword to find competitor tags..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleKeywordSearch)}
                      className="bg-white"
                    />
                  </div>
                  <Button onClick={handleKeywordSearch} size="large" disabled={loading}>
                    {loading ? 'Searching...' : 'Compare'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Video SEO Analysis Results */}
          {activeTool === 'analyze' && video && seoScore && titleAnalysis && descAnalysis && tagsAnalysis && (
            <div className="space-y-8">
              {/* Video Header */}
              <Card>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                      {video.thumbnail && (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <h2 className="text-headline-2 font-bold text-hof mb-2 line-clamp-2">
                        {video.title}
                      </h2>
                      <p className="text-body text-foggy mb-4">{video.channelTitle}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-caption text-foggy">Views</p>
                          <p className="font-semibold text-body text-hof">
                            {formatNumber(video.views)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Likes</p>
                          <p className="font-semibold text-body text-babu">
                            {formatNumber(video.likes)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Comments</p>
                          <p className="font-semibold text-body text-arches">
                            {formatNumber(video.comments)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Overall SEO Score */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-headline-3 font-semibold text-hof">
                      Overall SEO Score
                    </h3>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-headline-1 font-bold ${
                        seoScore.grade === 'A' ? 'bg-babu text-white' :
                        seoScore.grade === 'B' ? 'bg-arches text-white' :
                        seoScore.grade === 'C' ? 'bg-foggy text-white' :
                        'bg-rausch text-white'
                      }`}>
                        {seoScore.grade}
                      </div>
                      <p className="text-small text-foggy mt-2">{seoScore.totalScore}/100</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(seoScore.scores).map(([key, value]) => (
                      <div key={key} className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy capitalize mb-2">{key}</p>
                        <div className="w-full bg-hof/10 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 80 ? 'bg-babu' :
                              value >= 60 ? 'bg-arches' :
                              'bg-rausch'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <p className="text-body font-semibold text-hof">{value}/100</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Title Analysis */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-headline-3 font-semibold text-hof">
                      Title Analysis
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${
                      titleAnalysis.score >= 80 ? 'bg-babu/20 text-babu' :
                      titleAnalysis.score >= 60 ? 'bg-arches/20 text-arches' :
                      'bg-rausch/20 text-rausch'
                    }`}>
                      {titleAnalysis.score}/100
                    </span>
                  </div>

                  <div className="p-4 bg-background rounded-standard mb-4">
                    <p className="text-body text-hof">{video.title}</p>
                    <p className="text-caption text-foggy mt-2">
                      {titleAnalysis.length} characters
                    </p>
                  </div>

                  {titleAnalysis.issues.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-small text-hof mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {titleAnalysis.issues.map((issue, i) => (
                          <li key={i} className="text-small text-rausch flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {titleAnalysis.suggestions.length > 0 && (
                    <div>
                      <p className="font-semibold text-small text-hof mb-2">Suggestions:</p>
                      <ul className="space-y-1">
                        {titleAnalysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-small text-babu flex items-start gap-2">
                            <span className="mt-1">✓</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description Analysis */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-headline-3 font-semibold text-hof">
                      Description Analysis
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${
                      descAnalysis.score >= 80 ? 'bg-babu/20 text-babu' :
                      descAnalysis.score >= 60 ? 'bg-arches/20 text-arches' :
                      'bg-rausch/20 text-rausch'
                    }`}>
                      {descAnalysis.score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Length</p>
                      <p className="text-body font-semibold text-hof">{descAnalysis.length} chars</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Links</p>
                      <p className="text-body font-semibold text-hof">{descAnalysis.hasLinks ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Timestamps</p>
                      <p className="text-body font-semibold text-hof">{descAnalysis.hasTimestamps ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Hashtags</p>
                      <p className="text-body font-semibold text-hof">{descAnalysis.hasHashtags ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {descAnalysis.suggestions.length > 0 && (
                    <div>
                      <p className="font-semibold text-small text-hof mb-2">Optimization Tips:</p>
                      <ul className="space-y-1">
                        {descAnalysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-small text-babu flex items-start gap-2">
                            <span className="mt-1">✓</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Tags Analysis */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-headline-3 font-semibold text-hof">
                      Tags Analysis
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${
                      tagsAnalysis.score >= 80 ? 'bg-babu/20 text-babu' :
                      tagsAnalysis.score >= 60 ? 'bg-arches/20 text-arches' :
                      'bg-rausch/20 text-rausch'
                    }`}>
                      {tagsAnalysis.score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Tag Count</p>
                      <p className="text-body font-semibold text-hof">{tagsAnalysis.count} tags</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Avg Length</p>
                      <p className="text-body font-semibold text-hof">{tagsAnalysis.avgLength} chars</p>
                    </div>
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-small text-hof mb-2">Current Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-hof/10 text-hof text-caption rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tagsAnalysis.suggestions.length > 0 && (
                    <div>
                      <p className="font-semibold text-small text-hof mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {tagsAnalysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-small text-babu flex items-start gap-2">
                            <span className="mt-1">✓</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Extracted Keywords */}
              {keywords.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Top Keywords (From Title & Description)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {keywords.slice(0, 12).map((kw, i) => (
                        <div key={i} className="p-3 bg-background rounded-standard flex justify-between items-center">
                          <span className="text-small text-hof font-medium">{kw.keyword}</span>
                          <span className="px-2 py-1 bg-rausch/10 text-rausch text-caption rounded">
                            {kw.frequency}×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* SEO Recommendations */}
              {recommendations.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Optimization Recommendations
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-standard">
                          <svg className="w-5 h-5 text-babu flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-small text-hof">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Keyword Research Results */}
          {activeTool === 'keyword' && searchResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-2 font-semibold text-hof">
                  Top Videos for "{keywordInput}"
                </h2>
                <p className="text-body text-foggy">
                  {searchResults.length} results
                </p>
              </div>

              {searchResults.map((result, index) => {
                const resultSEO = calculateSEOScore(result)
                return (
                  <Card key={result.id}>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                          {result.thumbnail && (
                            <Image
                              src={result.thumbnail}
                              alt={result.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-caption font-bold">
                            #{index + 1}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-semibold text-body text-hof mb-2 line-clamp-2">
                            {result.title}
                          </h3>
                          <p className="text-small text-foggy mb-3">{result.channelTitle}</p>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <p className="text-caption text-foggy">Views</p>
                              <p className="font-semibold text-small text-hof">
                                {formatNumber(result.views)}
                              </p>
                            </div>
                            <div>
                              <p className="text-caption text-foggy">Tags</p>
                              <p className="font-semibold text-small text-hof">
                                {result.tags?.length || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-caption text-foggy">Title Length</p>
                              <p className="font-semibold text-small text-hof">
                                {result.title.length} chars
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-caption text-foggy mb-2">SEO Score</p>
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-headline-3 font-bold ${
                            resultSEO.grade === 'A' ? 'bg-babu text-white' :
                            resultSEO.grade === 'B' ? 'bg-arches text-white' :
                            'bg-hof/20 text-hof'
                          }`}>
                            {resultSEO.grade}
                          </div>
                          <p className="text-caption text-foggy mt-2">{resultSEO.totalScore}/100</p>
                        </div>
                      </div>

                      {result.tags && result.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-hof/10">
                          <p className="text-caption text-foggy mb-2">Tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.tags.slice(0, 10).map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-hof/10 text-hof text-caption rounded">
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 10 && (
                              <span className="px-2 py-1 text-foggy text-caption">
                                +{result.tags.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Tag Optimizer Results */}
          {activeTool === 'tags' && video && tagOverlap && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-headline-3 font-semibold text-hof mb-4">
                    Tag Overlap Analysis
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-background rounded-standard text-center">
                      <p className="text-foggy text-small mb-2">Your Tags</p>
                      <p className="text-headline-2 font-bold text-hof">{video.tags?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-background rounded-standard text-center">
                      <p className="text-foggy text-small mb-2">Common Tags</p>
                      <p className="text-headline-2 font-bold text-babu">{tagOverlap.commonTags.length}</p>
                    </div>
                    <div className="p-4 bg-background rounded-standard text-center">
                      <p className="text-foggy text-small mb-2">Overlap</p>
                      <p className="text-headline-2 font-bold text-arches">{tagOverlap.overlapPercentage}%</p>
                    </div>
                  </div>

                  {tagOverlap.missingTags.length > 0 && (
                    <div className="mb-6">
                      <p className="font-semibold text-body text-hof mb-3">
                        Suggested Tags (Used by Competitors):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tagOverlap.missingTags.map((tag, i) => (
                          <span key={i} className="px-3 py-2 bg-babu/10 text-babu text-small rounded-standard border-2 border-babu/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tagOverlap.uniqueTags.length > 0 && (
                    <div>
                      <p className="font-semibold text-body text-hof mb-3">
                        Your Unique Tags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tagOverlap.uniqueTags.map((tag, i) => (
                          <span key={i} className="px-3 py-2 bg-hof/10 text-hof text-small rounded-standard">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!video && !searchResults.length && !loading && (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-foggy/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                {activeTool === 'analyze' && 'Analyze Video SEO'}
                {activeTool === 'keyword' && 'Research Keywords'}
                {activeTool === 'tags' && 'Optimize Your Tags'}
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                {activeTool === 'analyze' && 'Enter a video URL above to get a comprehensive SEO analysis with optimization recommendations.'}
                {activeTool === 'keyword' && 'Search for keywords to see top-performing videos and analyze their SEO strategies.'}
                {activeTool === 'tags' && 'Compare your video tags with competitor videos to find optimization opportunities.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
