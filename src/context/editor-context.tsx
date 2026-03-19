import { createContext, useContext } from 'react'
import type { BlockEditorAPI } from '../hooks/use-block-editor'

const EditorContext = createContext<BlockEditorAPI | null>(null)

export const EditorProvider = EditorContext.Provider

export function useEditorContext(): BlockEditorAPI | null {
  return useContext(EditorContext)
}
