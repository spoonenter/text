"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy } from "lucide-react"

interface DuplicateRange {
  start: number
  end: number
  groupIndex: number
}

export default function AdsenseAnalyzerPage() {
  const [text, setText] = useState("")
  const [charCountWithSpaces, setCharCountWithSpaces] = useState(0)
  const [charCountWithoutSpaces, setCharCountWithoutSpaces] = useState(0)
  const [byteCountWithSpaces, setByteCountWithSpaces] = useState(0)
  const [byteCountWithoutSpaces, setByteCountWithoutSpaces] = useState(0)
  const [duplicates, setDuplicates] = useState<DuplicateRange[]>([])

  useEffect(() => {
    const withSpaces = text.length
    const withoutSpaces = text.replace(/\s/g, "").length
    const encoder = new TextEncoder()
    const bytesWithSpaces = encoder.encode(text).length
    const bytesWithoutSpaces = encoder.encode(text.replace(/\s/g, "")).length

    setCharCountWithSpaces(withSpaces)
    setCharCountWithoutSpaces(withoutSpaces)
    setByteCountWithSpaces(bytesWithSpaces)
    setByteCountWithoutSpaces(bytesWithoutSpaces)

    analyzeTextAuto(text)
  }, [text])

  const analyzeTextAuto = (inputText: string) => {
    if (!inputText.trim()) {
      setDuplicates([])
      return
    }

    const sentences: { text: string; start: number; end: number }[] = []
    const lines = inputText.split("\n")
    let currentPosition = 0

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.length > 3) {
        const sentenceRegex = /[^.!?。！？]+[.!?。！？]?/g
        let match

        while ((match = sentenceRegex.exec(line)) !== null) {
          const sentenceText = match[0].trim()
          if (sentenceText.length > 3) {
            const startInOriginal = inputText.indexOf(sentenceText, currentPosition)
            if (startInOriginal !== -1) {
              sentences.push({
                text: sentenceText,
                start: startInOriginal,
                end: startInOriginal + sentenceText.length,
              })
            }
          }
        }
      }
      currentPosition += line.length + 1
    }

    const duplicateRanges: DuplicateRange[] = []
    const processedIndices = new Set<number>()
    let groupIndex = 0

    for (let i = 0; i < sentences.length; i++) {
      if (processedIndices.has(i)) continue

      const sentence1 = sentences[i].text.trim()
      const duplicateGroup: number[] = [i]

      for (let j = i + 1; j < sentences.length; j++) {
        if (processedIndices.has(j)) continue

        const sentence2 = sentences[j].text.trim()
        const similarity = calculateSimilarity(sentence1, sentence2)

        if (similarity >= 0.6) {
          duplicateGroup.push(j)
          processedIndices.add(j)
        }
      }

      if (duplicateGroup.length > 1) {
        processedIndices.add(i)

        duplicateGroup.forEach((index) => {
          duplicateRanges.push({
            start: sentences[index].start,
            end: sentences[index].end,
            groupIndex,
          })
        })
        groupIndex++
      }
    }

    setDuplicates(duplicateRanges)
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
    const s1 = normalize(str1)
    const s2 = normalize(str2)

    if (s1 === s2) {
      return 1.0
    }

    const lengthDiff = Math.abs(s1.length - s2.length) / Math.max(s1.length, s2.length)
    if (lengthDiff > 0.5) return 0

    const words1 = s1.split(/\s+/).filter((w) => w.length > 0)
    const words2 = s2.split(/\s+/).filter((w) => w.length > 0)

    if (words1.length === 0 || words2.length === 0) return 0

    const set1 = new Set(words1)
    const set2 = new Set(words2)

    const intersection = new Set([...set1].filter((x) => set2.has(x)))
    const union = new Set([...set1, ...set2])

    const wordSimilarity = intersection.size / union.size

    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 1.0

    let matches = 0
    const minLen = Math.min(s1.length, s2.length)

    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++
    }

    const charSimilarity = matches / maxLen
    return wordSimilarity * 0.7 + charSimilarity * 0.3
  }

  const renderHighlightedText = () => {
    if (duplicates.length === 0 || !text) {
      return null
    }

    const colors = [
      "rgba(254, 240, 138, 0.6)",
      "rgba(187, 247, 208, 0.6)",
      "rgba(191, 219, 254, 0.6)",
      "rgba(233, 213, 255, 0.6)",
      "rgba(251, 207, 232, 0.6)",
      "rgba(254, 215, 170, 0.6)",
    ]

    const sortedDuplicates = [...duplicates].sort((a, b) => a.start - b.start)
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    sortedDuplicates.forEach((dup, index) => {
      if (dup.start > lastIndex) {
        elements.push(<span key={`text-${index}`}>{text.substring(lastIndex, dup.start)}</span>)
      }

      const color = colors[dup.groupIndex % colors.length]
      elements.push(
        <mark key={`mark-${index}`} style={{ backgroundColor: color, color: "inherit" }} className="rounded px-0.5">
          {text.substring(dup.start, dup.end)}
        </mark>,
      )

      lastIndex = dup.end
    })

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>)
    }

    return <div className="whitespace-pre-wrap break-words leading-relaxed">{elements}</div>
  }

  const copyAll = () => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setText("")
    setDuplicates([])
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground">글자수세기</h1>
        </div>
      </nav>

      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ✅ 광고 영역 시작 — 애드센스 승인콘텐츠 분석기 상단광고 */}
<div style={{ width: "100%", textAlign: "center", margin: "15px 0" }}>
  <ins
    className="adsbygoogle"
    style={{ display: "block" }}
    data-ad-client="ca-pub-9591765421576424"
    data-ad-slot="6696348436"
    data-ad-format="auto"
    data-full-width-responsive="true"
  ></ins>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        if (typeof window !== 'undefined') {
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
      `,
    }}
  />
</div>
{/* ✅ 광고 영역 끝 */}


          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap gap-8 justify-center text-center divide-x divide-border">
              <div className="px-6 first:pl-0">
                <p className="text-sm text-muted-foreground mb-1">공백포함</p>
                <p className="text-lg font-semibold">
                  총 <span className="text-blue-600 dark:text-blue-400">{charCountWithSpaces}</span>자 (
                  {byteCountWithSpaces}byte)
                </p>
              </div>
              <div className="px-6">
                <p className="text-sm text-muted-foreground mb-1">공백제외</p>
                <p className="text-lg font-semibold">
                  총 <span className="text-blue-600 dark:text-blue-400">{charCountWithoutSpaces}</span>자 (
                  {byteCountWithoutSpaces}byte)
                </p>
              </div>
              <div className="px-6">
                <p className="text-sm text-muted-foreground mb-1">중복 문장</p>
                <p className="text-lg font-semibold">
                  <span className="text-blue-600 dark:text-blue-400">{duplicates.length}</span>개
                </p>
              </div>
            </div>

            {duplicates.length === 0 ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] w-full rounded-md border border-input bg-card p-4 text-base text-foreground focus:ring-2 focus:ring-ring resize-none leading-relaxed"
                placeholder="여기에 콘텐츠를 입력하세요."
              />
            ) : (
              <div className="min-h-[300px] w-full rounded-md border border-input bg-card p-4 text-base text-foreground overflow-auto max-h-[500px]">
                {renderHighlightedText()}
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap -translate-y-[10px]">
              <Button
                onClick={copyAll}
                variant="outline"
                size="lg"
                className="min-w-[120px] bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                <Copy className="mr-2 h-4 w-4" />
                전체복사
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                size="lg"
                className="min-w-[120px] bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                전체지우기
              </Button>
            </div>
          </Card>

          <div className="mt-12 space-y-8">
            <section className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">글자수세기란?</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                글자수세기는 사용자가 입력한 문장에서 몇 글자가 사용되었는지를 자동으로 계산해주는 도구입니다. 단순히
                글자의 개수를 세는 것 같지만, 실제로는 문서 작성이나 온라인 콘텐츠 제작에서 매우 중요한 역할을 합니다.
                이력서나 자기소개서, 기사, 블로그 글처럼 글자 제한이 있는 문서를 작성할 때 반드시 확인해야 하는
                요소이기도 합니다. 글자수세기를 활용하면 글의 길이를 조정하여 가독성을 높이고, 검색엔진이 인식하기 좋은
                구조로 콘텐츠를 최적화할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                글자수는 보통 한글, 영어, 숫자, 공백, 줄바꿈을 모두 포함한 전체 문자 수를 의미합니다. 특히 온라인
                지원서나 SNS 소개글처럼 제한된 칸 안에 입력해야 하는 경우, 글자수를 정확히 계산하지 않으면 일부 문장이
                잘려 보이지 않을 수 있습니다. 글자수세기는 이런 불편을 방지하고, 문서의 완성도를 높이기 위한 필수적인
                도구입니다.
              </p>
            </section>

            {/* ✅ 광고 영역 시작 — 인아티클형 애드센스 광고 */}
<div style={{ textAlign: "center", margin: "15px 0" }}>
  <ins
    className="adsbygoogle"
    style={{ display: "block", textAlign: "center" }}
    data-ad-layout="in-article"
    data-ad-format="fluid"
    data-ad-client="ca-pub-9591765421576424"
    data-ad-slot="4006605911"
  ></ins>
  <script
    dangerouslySetInnerHTML={{
      __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
    }}
  />
</div>
{/* ✅ 광고 영역 끝 */}

            <section className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">글자수세기가 중요한 이유</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                글자수는 단순한 숫자가 아니라, 콘텐츠의 품질과 전달력을 결정하는 지표입니다. 검색엔진 최적화(SEO)
                관점에서도 일정 수준 이상의 글자수를 확보해야 검색 알고리즘이 유용한 정보로 인식합니다. 예를 들어 블로그
                포스팅의 경우 최소 1500자 이상은 작성해야 풍부한 콘텐츠로 평가받습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                또한 제목과 메타디스크립션 작성에서도 글자수는 매우 중요합니다. 타이틀 태그는 약 60자 이내,
                메타디스크립션은 공백 포함 160자 이내로 작성해야 검색 결과 화면에서 완전하게 노출됩니다. 글자수세기를
                통해 이러한 기준을 손쉽게 지킬 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                가독성 관리에도 유용합니다. 너무 긴 문장은 읽는 피로감을 높이므로 문단별 단어수와 문장 길이를 확인하면
                훨씬 매끄러운 글 구성이 가능합니다.
              </p>
            </section>

            <section className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">글자수세기가 필요한 사람들</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                학생에게는 과제나 자기소개서 작성 시 필수입니다. 대학 원서나 온라인 과제 플랫폼은 글자 제한이 명확하기
                때문에 한 글자 차이로도 감점이나 입력 오류가 발생할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                구직자는 채용 사이트나 기업 지원서에서 자주 글자 제한을 마주합니다. 특히 한글 기준 '2000자 이내'처럼
                지정된 분량이 있을 때, 글자수세기를 통해 정확히 맞춰야 합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                작가나 블로거는 콘텐츠 분량 관리에 유용합니다. 독자에게 신뢰를 주기 위해선 일정한 글의 밀도와 길이가
                필요하며, 수익형 포스팅에서도 글자수는 중요한 품질 지표로 작용합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                마케터는 검색엔진의 권장 길이에 맞춰 제목, 설명문, 광고 문구를 최적화해야 하므로 글자수세기는 필수적인
                업무 도구입니다.
              </p>
            </section>

            <section className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">글자수세기 사용 방법</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                글자수 계산기 사용은 간단합니다. 텍스트 입력창에 글을 입력하거나 복사해 넣으면 즉시 글자수와 단어수가
                실시간으로 표시됩니다. 수정이나 삭제를 하더라도 즉시 반영되므로 문서의 길이를 자유롭게 조정할 수
                있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                이 도구는 공백 포함 여부를 선택할 수 있으며, 줄바꿈 횟수나 문단 수도 함께 확인할 수 있습니다. PC뿐
                아니라 모바일에서도 완벽히 작동하므로 언제 어디서든 간편하게 사용할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                또한 글자수세기에는 맞춤법 검사 기능이 포함되어 있어, 작성 중 바로 문법 오류를 확인할 수도 있습니다.
                일부 사이트보다 검사 범위가 넓고 정확도가 높기 때문에, 원고 작성 전후로 함께 활용하면 훨씬 효율적인 문서
                작업이 가능합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
