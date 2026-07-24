import { useState } from 'react'
import { Input, Upload, Tag, Button, Space, InputNumber, Typography, Alert, Collapse } from 'antd'
import { UploadOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import './App.css'

const { Title } = Typography
const MAX_PUZZLE_SIZES = 3

// Helper function to get character width
const getCharacterWidth = (char) => {
  // Alphabet (a-z, A-Z) and numbers (0-9) = 1
  if (/[a-zA-Z0-9]/.test(char)) {
    return 1
  }
  // Spaces and all punctuation = 0.5
  return 0.5
}

// Helper function to calculate word width
const calculateWordWidth = (word) => {
  return word.split('').reduce((sum, char) => sum + getCharacterWidth(char), 0)
}

// Helper function to fit quote into lines
const fitQuoteIntoLines = (quote, maxCharsPerLine, maxLines) => {
  const words = quote.trim().split(/\s+/)
  const lines = []
  let currentLine = ''
  let currentLineWidth = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const wordWidth = calculateWordWidth(word)

    // Check if word is too long to fit on any line
    if (wordWidth > maxCharsPerLine) {
      return { success: false, lines: [] }
    }

    // Calculate width if we add this word to current line
    const spaceWidth = currentLine ? 0.5 : 0 // No space before first word
    const totalWidth = currentLineWidth + spaceWidth + wordWidth

    if (totalWidth <= maxCharsPerLine) {
      // Word fits on current line
      if (currentLine) {
        currentLine += ' ' + word
        currentLineWidth += spaceWidth + wordWidth
      } else {
        currentLine = word
        currentLineWidth = wordWidth
      }
    } else {
      // Word doesn't fit, start new line
      if (currentLine) {
        lines.push(currentLine)
      }

      // Check if we've exceeded max lines
      if (lines.length >= maxLines) {
        return { success: false, lines: [] }
      }

      currentLine = word
      currentLineWidth = wordWidth
    }
  }

  // Add the last line
  if (currentLine) {
    lines.push(currentLine)
  }

  // Check if total lines exceed max
  if (lines.length > maxLines) {
    return { success: false, lines: [] }
  }

  // Return lines in uppercase
  return {
    success: true,
    lines: lines.map(line => line.toUpperCase())
  }
}

function App() {
  const [quote, setQuote] = useState('')
  const [puzzleSizes, setPuzzleSizes] = useState([
    { id: 1, width: 8, height: 8 },
    { id: 2, width: 10, height: 10 }
  ])
  const [newWidth, setNewWidth] = useState(null)
  const [newHeight, setNewHeight] = useState(null)
  const [nextId, setNextId] = useState(3)
  const [checkResults, setCheckResults] = useState(null)

  const handleRemoveSize = (id) => {
    setPuzzleSizes(puzzleSizes.filter(size => size.id !== id))
  }

  const handleAddSize = () => {
    if (newWidth > 0 && newHeight > 0 && puzzleSizes.length < MAX_PUZZLE_SIZES) {
      setPuzzleSizes([...puzzleSizes, {
        id: nextId,
        width: newWidth,
        height: newHeight
      }])
      setNextId(nextId + 1)
    }
  }

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setQuote(e.target.result)
    }
    reader.readAsText(file)
    return false // Prevent automatic upload
  }

  const handleCheck = () => {
    // Parse quotes from input (split by newlines, filter empty)
    const quotes = quote.split('\n').filter(q => q.trim() !== '')

    // Process each quote against all puzzle sizes
    const results = quotes.map((quoteText, index) => {
      const quoteResult = {
        id: index,
        quote: quoteText.trim(),
        results: []
      }

      // Check against each puzzle size
      puzzleSizes.forEach(size => {
        const result = fitQuoteIntoLines(
          quoteText.trim(),
          size.width,
          size.height
        )

        quoteResult.results.push({
          puzzleSize: `${size.width}x${size.height}`,
          width: size.width,
          height: size.height,
          success: result.success,
          lines: result.lines
        })
      })

      return quoteResult
    })

    setCheckResults(results)
  }

  return (
    <div className="app-container">
      <div className="content">
        <Title level={2}>Word Game Puzzle Size Checker</Title>

        <div className="section">
          <Title level={4}>Enter quote/list of quotes (note: one quote per line):</Title>
          <Input.TextArea
            placeholder="Enter your quote here..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 8 }}
            style={{ marginBottom: 16, fontSize: '20px' }}
          />

          <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '21px' }}>Or</div>

          <div style={{ textAlign: 'center' }}>
            <Upload
              beforeUpload={handleFileUpload}
              maxCount={1}
              accept=".txt"
            >
              <Button icon={<UploadOutlined />} size="large">Upload File</Button>
            </Upload>
          </div>
        </div>

        <div className="section">
          <Title level={4}>Choose puzzle size:</Title>
          <Space wrap style={{ marginBottom: 16 }}>
            {puzzleSizes.map(size => (
              <Tag
                key={size.id}
                closable
                onClose={() => handleRemoveSize(size.id)}
                style={{ fontSize: '20px', padding: '6px 12px' }}
              >
                {size.width}x{size.height}
              </Tag>
            ))}
          </Space>

          <div style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <InputNumber
                  min={1}
                  max={50}
                  value={newWidth}
                  onChange={setNewWidth}
                  placeholder="#characters"
                  disabled={puzzleSizes.length >= MAX_PUZZLE_SIZES}
                  size="large"
                  style={{ width: '130px' }}
                />
                <span style={{ fontSize: '23px' }}>x</span>
                <InputNumber
                  min={1}
                  max={50}
                  value={newHeight}
                  onChange={setNewHeight}
                  placeholder="#lines"
                  disabled={puzzleSizes.length >= MAX_PUZZLE_SIZES}
                  size="large"
                  style={{ width: '130px' }}
                />
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddSize}
                  disabled={puzzleSizes.length >= MAX_PUZZLE_SIZES}
                  size="large"
                >
                  Add Puzzle Size
                </Button>
              </Space>
              {puzzleSizes.length >= MAX_PUZZLE_SIZES && (
                <Alert
                  message="Max number of tags is 3. To add more tag, delete existing tag(s)."
                  type="info"
                  showIcon
                  style={{ marginTop: 8, fontSize: '20px' }}
                />
              )}
            </Space>
          </div>
        </div>

        <div className="section" style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleCheck}
            disabled={!quote || puzzleSizes.length === 0}
          >
            Check
          </Button>
        </div>

        <div className="section output-section">
          <Title level={4}>Output:</Title>
          <div className="output-space">
            {!checkResults ? (
              <p style={{ color: '#999', fontStyle: 'italic', fontSize: '20px' }}>
                Results will appear here after checking...
              </p>
            ) : (
              <Collapse>
                {checkResults.map((result) => {
                  const hasSuccess = result.results.some(r => r.success)

                  return (
                    <Collapse.Panel
                      key={result.id}
                      header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap' }}>
                          <span style={{
                            flex: '0 1 70%',
                            fontSize: '20px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {result.quote}
                          </span>
                          <Space wrap style={{ flex: '0 1 30%', justifyContent: 'flex-end' }}>
                            {result.results.map((r, idx) => (
                              <Tag
                                key={idx}
                                icon={r.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                color={r.success ? 'success' : 'error'}
                                style={{ fontSize: '20px', padding: '5px 12px' }}
                              >
                                {r.puzzleSize}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      }
                    >
                      {hasSuccess ? (
                        <div className="puzzle-results">
                          {result.results.filter(r => r.success).map((r, idx) => (
                            <div key={idx} className="puzzle-box">
                              <div className="puzzle-header">{r.puzzleSize}</div>
                              <div className="puzzle-lines">
                                {r.lines.map((line, lineIdx) => (
                                  <div key={lineIdx} className="puzzle-line-content">
                                    {line}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic', margin: 0, fontSize: '20px' }}>
                          This quote does not fit in any of the selected puzzle sizes.
                        </p>
                      )}
                    </Collapse.Panel>
                  )
                })}
              </Collapse>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
