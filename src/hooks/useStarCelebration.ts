import { useEffect, useRef } from 'react'

type TrailPoint = { x: number; y: number }

class WishingStar {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
  pulsePhase: number
  trail: TrailPoint[]
  gravity: number

  constructor(viewportHeight: number) {
    this.x = -60
    this.y = Math.random() * viewportHeight
    this.size = 8 + Math.random() * 10
    this.speedX = 8 + Math.random() * 6
    this.speedY = (Math.random() - 0.5) * 3
    this.rotation = 0
    this.rotationSpeed = 0.06 + Math.random() * 0.2
    this.opacity = 1
    this.pulsePhase = Math.random() * Math.PI * 2
    this.trail = []
    this.gravity = 0.012 + Math.random() * 0.02
    const colors = ['#FFD700', '#C0C0C0', '#3b82f6', '#10b981', '#ec4899']
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(viewportWidth: number) {
    this.x += this.speedX
    this.speedY += this.gravity
    this.y += this.speedY
    this.rotation += this.rotationSpeed
    this.pulsePhase += 0.2

    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 10) this.trail.shift()

    if (this.x > viewportWidth - 220) this.opacity -= 0.02
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7

    this.trail.forEach((point, index) => {
      const ratio = index / Math.max(this.trail.length, 1)
      const trailOpacity = ratio * this.opacity * 0.5
      const trailSize = this.size * ratio * 0.45

      ctx.save()
      ctx.globalAlpha = trailOpacity
      ctx.fillStyle = this.color
      ctx.shadowBlur = 14
      ctx.shadowColor = this.color
      ctx.beginPath()
      ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.scale(pulse, pulse)

    ctx.beginPath()
    for (let i = 0; i < 5; i += 1) {
      const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2
      const outerRadius = this.size
      const innerRadius = this.size * 0.4

      const outerX = Math.cos(angle) * outerRadius
      const outerY = Math.sin(angle) * outerRadius
      const innerAngle = angle + Math.PI / 5
      const innerX = Math.cos(innerAngle) * innerRadius
      const innerY = Math.sin(innerAngle) * innerRadius

      if (i === 0) ctx.moveTo(outerX, outerY)
      else ctx.lineTo(outerX, outerY)
      ctx.lineTo(innerX, innerY)
    }
    ctx.closePath()

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(1, `${this.color}80`)
    ctx.fillStyle = gradient
    ctx.shadowBlur = 20
    ctx.shadowColor = this.color
    ctx.fill()

    ctx.shadowBlur = 10
    ctx.fillStyle = `rgba(255,255,255,${pulse})`
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  isOffScreen(viewportWidth: number, viewportHeight: number) {
    return this.x > viewportWidth + 60 || this.y > viewportHeight + 120 || this.opacity <= 0
  }
}

class StarCelebration {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  stars: WishingStar[]
  isAnimating: boolean
  rafId: number | null

  constructor() {
    this.canvas = document.createElement('canvas')
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not initialize star celebration canvas context')
    }
    this.ctx = context
    this.stars = []
    this.isAnimating = false
    this.rafId = null

    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '9999'
    this.resize()
    document.body.appendChild(this.canvas)
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  trigger() {
    const numStars = 15 + Math.floor(Math.random() * 11)
    for (let i = 0; i < numStars; i += 1) {
      window.setTimeout(() => {
        this.stars.push(new WishingStar(this.canvas.height))
      }, i * 45)
    }
    if (!this.isAnimating) {
      this.isAnimating = true
      this.animate()
    }
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.stars = this.stars.filter((star) => {
      star.update(this.canvas.width)
      star.draw(this.ctx)
      return !star.isOffScreen(this.canvas.width, this.canvas.height)
    })

    if (this.stars.length > 0) {
      this.rafId = window.requestAnimationFrame(this.animate)
    } else {
      this.isAnimating = false
      this.rafId = null
    }
  }

  destroy() {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId)
    this.canvas.remove()
    this.stars = []
    this.isAnimating = false
    this.rafId = null
  }
}

export function useStarCelebration() {
  const managerRef = useRef<StarCelebration | null>(null)

  useEffect(() => {
    managerRef.current = new StarCelebration()
    const onResize = () => managerRef.current?.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      managerRef.current?.destroy()
      managerRef.current = null
    }
  }, [])

  return () => {
    managerRef.current?.trigger()
  }
}
