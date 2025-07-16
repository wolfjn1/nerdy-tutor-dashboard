'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Layers, Plus, X, ChevronLeft, ChevronRight, RotateCw, Eye, EyeOff, BookOpen, Shuffle } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useRouter } from 'next/navigation'

interface FlashCard {
  id: string
  front: string
  back: string
}

interface Deck {
  id: string
  name: string
  subject: string
  cards: FlashCard[]
  createdAt: Date
}

export default function FlashcardsPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: '1',
      name: 'Spanish Vocabulary',
      subject: 'Language',
      cards: [
        { id: '1', front: 'Hello', back: 'Hola' },
        { id: '2', front: 'Thank you', back: 'Gracias' },
        { id: '3', front: 'Good morning', back: 'Buenos días' },
      ],
      createdAt: new Date()
    }
  ])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckSubject, setNewDeckSubject] = useState('')
  
  // Study mode states
  const [isStudying, setIsStudying] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0 })

  // Card creation states
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')

  const createNewDeck = () => {
    if (newDeckName.trim()) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: newDeckName,
        subject: newDeckSubject || 'General',
        cards: [],
        createdAt: new Date()
      }
      setDecks([...decks, newDeck])
      setNewDeckName('')
      setNewDeckSubject('')
      setIsCreatingDeck(false)
      setSelectedDeck(newDeck)
    }
  }

  const addCardToDeck = () => {
    if (selectedDeck && newCardFront.trim() && newCardBack.trim()) {
      const newCard: FlashCard = {
        id: Date.now().toString(),
        front: newCardFront,
        back: newCardBack
      }
      const updatedDeck = {
        ...selectedDeck,
        cards: [...selectedDeck.cards, newCard]
      }
      setSelectedDeck(updatedDeck)
      setDecks(decks.map(d => d.id === selectedDeck.id ? updatedDeck : d))
      setNewCardFront('')
      setNewCardBack('')
      setIsAddingCard(false)
    }
  }

  const deleteCard = (cardId: string) => {
    if (selectedDeck) {
      const updatedDeck = {
        ...selectedDeck,
        cards: selectedDeck.cards.filter(c => c.id !== cardId)
      }
      setSelectedDeck(updatedDeck)
      setDecks(decks.map(d => d.id === selectedDeck.id ? updatedDeck : d))
    }
  }

  const nextCard = () => {
    if (selectedDeck && currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const markAnswer = (correct: boolean) => {
    setStudyStats({
      ...studyStats,
      [correct ? 'correct' : 'incorrect']: studyStats[correct ? 'correct' : 'incorrect'] + 1
    })
    nextCard()
  }

  const shuffleCards = () => {
    if (selectedDeck) {
      const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
      const updatedDeck = { ...selectedDeck, cards: shuffled }
      setSelectedDeck(updatedDeck)
      setDecks(decks.map(d => d.id === selectedDeck.id ? updatedDeck : d))
      setCurrentCardIndex(0)
    }
  }

  if (isStudying && selectedDeck && selectedDeck.cards.length > 0) {
    const currentCard = selectedDeck.cards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / selectedDeck.cards.length) * 100

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Study Mode Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsStudying(false)
              setCurrentCardIndex(0)
              setShowAnswer(false)
              setStudyStats({ correct: 0, incorrect: 0 })
            }}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Exit Study Mode
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {selectedDeck.cards.length}
            </span>
            <div className="flex gap-2 text-sm">
              <span className="text-green-600">✓ {studyStats.correct}</span>
              <span className="text-red-600">✗ {studyStats.incorrect}</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Flashcard */}
        <div className="flex justify-center items-center min-h-[400px]">
          <motion.div
            key={currentCard.id}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-2xl"
          >
            <Card 
              className="p-12 cursor-pointer select-none"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-4">
                  {showAnswer ? 'Answer' : 'Question'}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showAnswer ? 'back' : 'front'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-2xl font-medium"
                  >
                    {showAnswer ? currentCard.back : currentCard.front}
                  </motion.div>
                </AnimatePresence>
                
                <div className="mt-8 text-sm text-gray-500">
                  {showAnswer ? 'Click to see question' : 'Click to reveal answer'}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {showAnswer && (
            <>
              <Button
                variant="outline"
                onClick={() => markAnswer(false)}
                className="text-red-600 hover:bg-red-50"
              >
                Got it Wrong
              </Button>
              <Button
                variant="outline"
                onClick={() => markAnswer(true)}
                className="text-green-600 hover:bg-green-50"
              >
                Got it Right!
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={nextCard}
            disabled={currentCardIndex === selectedDeck.cards.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tools')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          </div>
        </div>

        {!selectedDeck && (
          <Button
            variant="gradient"
            gradientType="nerdy"
            size="sm"
            onClick={() => setIsCreatingDeck(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Deck
          </Button>
        )}
      </motion.div>

      {selectedDeck ? (
        // Deck Detail View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Deck Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDeck(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Decks
                </Button>
                <div>
                  <h2 className="text-xl font-semibold">{selectedDeck.name}</h2>
                  <p className="text-sm text-gray-600">{selectedDeck.subject} • {selectedDeck.cards.length} cards</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shuffleCards}
                  disabled={selectedDeck.cards.length < 2}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle
                </Button>
                <Button
                  variant="gradient"
                  gradientType="nerdy"
                  size="sm"
                  onClick={() => setIsStudying(true)}
                  disabled={selectedDeck.cards.length === 0}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study Now
                </Button>
              </div>
            </div>

            {/* Add Card Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Card
            </Button>
          </Card>

          {/* Cards List */}
          <div className="grid gap-4">
            {selectedDeck.cards.length === 0 ? (
              <Card className="p-12 text-center">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No cards in this deck yet</p>
                <Button
                  variant="gradient"
                  gradientType="nerdy"
                  onClick={() => setIsAddingCard(true)}
                >
                  Add Your First Card
                </Button>
              </Card>
            ) : (
              selectedDeck.cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Front</p>
                          <p className="font-medium">{card.front}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Back</p>
                          <p className="text-gray-700">{card.back}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCard(card.id)}
                        className="ml-4 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      ) : (
        // Decks List View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ y: -4 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedDeck(deck)}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">{deck.name}</h3>
                  <p className="text-sm text-gray-600">{deck.subject}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {deck.cards.length} cards
                  </span>
                  <Button variant="ghost" size="sm">
                    Study →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Empty State */}
          {decks.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">No flashcard decks yet</h3>
                <p className="text-gray-600 mb-4">Create your first deck to get started</p>
                <Button
                  variant="gradient"
                  gradientType="nerdy"
                  onClick={() => setIsCreatingDeck(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Deck
                </Button>
              </Card>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Deck Modal */}
      <AnimatePresence>
        {isCreatingDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsCreatingDeck(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Create New Deck</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deck Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Spanish Vocabulary"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Language"
                      value={newDeckSubject}
                      onChange={(e) => setNewDeckSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreatingDeck(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      gradientType="nerdy"
                      className="flex-1"
                      onClick={createNewDeck}
                      disabled={!newDeckName.trim()}
                    >
                      Create Deck
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsAddingCard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Front (Question)</label>
                    <textarea
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="e.g., What is the capital of France?"
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Back (Answer)</label>
                    <textarea
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="e.g., Paris"
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsAddingCard(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      gradientType="nerdy"
                      className="flex-1"
                      onClick={addCardToDeck}
                      disabled={!newCardFront.trim() || !newCardBack.trim()}
                    >
                      Add Card
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 