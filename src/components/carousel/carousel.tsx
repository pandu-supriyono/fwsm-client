import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Button, Stack } from '@chakra-ui/react'
import {
  Children,
  cloneElement,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'

const ControlButton = ({ direction, clickHandler }) => {
  const icon = direction === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />
  const positionProps = {
    left: direction === 'left' ? 0 : undefined,
    right: direction === 'right' ? 0 : undefined
  }

  return (
    <Button
      position="absolute"
      borderRadius="34px"
      px="0"
      onClick={(e) => clickHandler(e)}
      top="50%"
      zIndex="1"
      fontSize="5xl"
      w={66}
      h={66}
      transform="auto"
      translateY="-50%"
      boxShadow="md"
      data-carousel-direction={direction}
      {...positionProps}
    >
      {icon}
    </Button>
  )
}

interface CarouselProps {
  children: ReactNode
}

const Carousel = (props: CarouselProps) => {
  const carouselContainer = useRef()
  const [currentItemIndex, setCurrentItem] = useState(0)
  const [currentItemOffset, setCurrentItemOffset] = useState(0)
  //@ts-ignore
  const numberOfItems = props.children.length - 1

  const goToPrevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItem(currentItemIndex - 1)
    }
  }

  const goToNextItem = () => {
    if (currentItemIndex < numberOfItems) {
      setCurrentItem(currentItemIndex + 1)
    }
  }

  const handleButtonClick = (e) => {
    const direction = e.currentTarget.dataset.carouselDirection

    if (direction === 'left') {
      goToPrevItem()
    }

    if (direction === 'right') {
      goToNextItem()
    }
  }

  useEffect(() => {
    setCurrentItemOffset(
      //@ts-ignore
      carouselContainer.current.children[currentItemIndex].offsetLeft
    )
  }, [currentItemIndex])

  useEffect(() => {
    const handleResize = () => {
      setCurrentItemOffset(
        //@ts-ignore
        carouselContainer.current.children[currentItemIndex].offsetLeft
      )
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  })

  return (
    <Box position="relative">
      {currentItemIndex > 0 && (
        <ControlButton direction="left" clickHandler={handleButtonClick} />
      )}

      {currentItemIndex < numberOfItems && (
        <ControlButton direction="right" clickHandler={handleButtonClick} />
      )}

      <Stack
        //@ts-ignore
        ref={carouselContainer}
        flex-wrap="nowrap"
        overflowX="visible"
        direction="row"
        spacing={35}
        transform="auto-gpu"
        translateX={currentItemOffset * -1}
        transition="all 0.4s ease 0s"
        as="ul"
        listStyleType="none"
      >
        {Children.map(props.children, (child, index) =>
          //@ts-ignore
          cloneElement(child, {
            index,
            isActive: index === currentItemIndex
          })
        )}
      </Stack>
    </Box>
  )
}

export default Carousel
