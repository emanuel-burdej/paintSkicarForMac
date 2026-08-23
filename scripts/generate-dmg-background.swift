import AppKit

let width = 660.0
let height = 400.0
let outputPath = CommandLine.arguments[1]

let image = NSImage(size: NSSize(width: width, height: height))
image.lockFocus()

NSColor(calibratedRed: 0.95, green: 0.95, blue: 0.97, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: height)).fill()

let arrowColor = NSColor(calibratedRed: 0.45, green: 0.45, blue: 0.48, alpha: 1)
let shaft = NSBezierPath()
shaft.move(to: NSPoint(x: 210, y: 200))
shaft.line(to: NSPoint(x: 390, y: 200))
shaft.lineWidth = 8
shaft.lineCapStyle = .round
arrowColor.setStroke()
shaft.stroke()

let head = NSBezierPath()
head.move(to: NSPoint(x: 370, y: 180))
head.line(to: NSPoint(x: 410, y: 200))
head.line(to: NSPoint(x: 370, y: 220))
head.lineWidth = 8
head.lineCapStyle = .round
head.lineJoinStyle = .round
arrowColor.setStroke()
head.stroke()

image.unlockFocus()

guard
  let tiff = image.tiffRepresentation,
  let rep = NSBitmapImageRep(data: tiff),
  let png = rep.representation(using: .png, properties: [:])
else {
  fputs("Failed to render DMG background.\n", stderr)
  exit(1)
}

do {
  try png.write(to: URL(fileURLWithPath: outputPath))
} catch {
  fputs("Failed to write DMG background: \(error)\n", stderr)
  exit(1)
}
