import React from 'react'
import { createRef, ReactElement, useEffect, useState } from 'react'
import './index.css'

import { NestedChild } from './NestedChild'
import { TransitionGroup, Transition, TransitionStatus } from 'react-transition-group'

type Props = {
  children?: ReactElement | ReactElement[]
  currentOpenedModal: string
  setCurrentOpenedModal: (a: string) => void
  onClose: () => void
}

const NestedModal = ({ children, currentOpenedModal, setCurrentOpenedModal, onClose }: Props): any => {
  const [show, setShow] = useState<Map<string, boolean>>(new Map())
  const indexBasedLeft = (index: number) => index * 5

  useEffect(() => {
    const newMap = () => {
      const a = new Map()
      let addedShow = true
      if (Array.isArray(children)) {
        children?.forEach((item) => {
          a.set(item.props.id, addedShow)
          if (item.props.id === currentOpenedModal) {
            addedShow = false
          }
        })
      } else {
        a.set(children?.props.id, true)
      }
      return a
    }

    setShow(newMap())
  }, [children, currentOpenedModal])

  if (!currentOpenedModal) {
    return null
  }

  if (!children) {
    return null
  }

  const handleClose = (index: number) => {
    if (Array.isArray(children)) {
      if (index === 0) {
        setCurrentOpenedModal('')
        onClose()
        children[0].props?.onClose && children[0].props.onClose()
      }

      setCurrentOpenedModal(children[index - 1]?.props.id)
      children[index]?.props?.onClose && children[index]?.props?.onClose()
    } else {
      setCurrentOpenedModal('')
      onClose()
      children.props?.onClose && children.props.onClose()
    }
  }

  const handleBaseClick = (event: any) => {
    if (event.target.id === 'nm_nested_base') {
      handleClose(0)
    }
  }

  const handleModalClose = (event: any, index: number) => {
    if (Array.isArray(children)) {
      if (event.target?.id === 'nm_back_button' || event.target?.parentElement.id === 'nm_back_button') {
        handleClose(index)

        return
      }

      const currentOpenedChild = children.findIndex((item) => item.props.id === currentOpenedModal)
      if (currentOpenedChild !== index) {
        handleClose(index + 1)
        return
      }
    }
  }

  if (!Array.isArray(children)) {
    return (
      <div id='nm_nested_base' className='nm_nested-base' onClick={handleBaseClick}>
        <NestedChild
          show={show.get(children?.props.id) || false}
          indexBasedLeft={indexBasedLeft(0)}
          index={0}
          handleClose={handleClose}
          handleModalClose={handleModalClose}
          nodeRef={null}
          style={null}
          title={children.props.title}
        >
          {children}
        </NestedChild>
      </div>
    )
  }

  const defaultStyle = (index: number) => ({
    transition: 'margin-left 300ms ease',
    left: `${indexBasedLeft(index) + 4}%`,
  })

  const transitionStyles = (index: number): Record<TransitionStatus, any> => ({
    entering: { left: `${indexBasedLeft(index) + 4}%` },
    entered: { left: `${indexBasedLeft(index)}%` },
    exiting: {},
    exited: {},
    unmounted: {},
  })

  return (
    <div id='nm_nested_base' className='nm_nested-base' onClick={handleBaseClick}>
      <TransitionGroup>
        {children.map((item, index) => {
          const nodeRef: any = createRef<HTMLDivElement>()
          return (
            <Transition
              nodeRef={nodeRef}
              in={show.get(item.props.id) || false}
              appear={show.get(item.props.id) || false}
              key={item.props.id}
              timeout={500}
            >
              {(state) => (
                <NestedChild
                  nodeRef={nodeRef}
                  index={index}
                  indexBasedLeft={indexBasedLeft(index)}
                  title={item.props.title}
                  show={show.get(item.props.id) || false}
                  handleClose={handleClose}
                  handleModalClose={handleModalClose}
                  style={{
                    ...defaultStyle(index),
                    ...transitionStyles(index)[state],
                  }}
                >
                  {item}
                </NestedChild>
              )}
            </Transition>
          )
        })}
      </TransitionGroup>
    </div>
  )
}

export default NestedModal
