export interface Collection {
  id: string
  name_en: string
  name_ar: string
  slug: string
  description_en: string | null
  total_hadiths: number
  total_books: number
  scholar: string
  is_featured: boolean
  grade_distribution: {
    sahih: number
    hasan: number
    daif: number
  }
}

export interface Book {
  id: string
  collection_id: string
  name_en: string
  name_ar: string
  number: number
  total_hadiths: number
  total_chapters: number
  sort_order: number | null
}

export interface Chapter {
  id: string
  book_id: string
  name_en: string
  name_ar: string
  number: number
  total_hadiths: number
  sort_order: number | null
}

export interface Hadith {
  id: string
  hadith_number: number
  arabic_text: string
  english_translation: string
  narrator: string
  grade: string
  reference: string
  collection: string
  book_number: number
}
