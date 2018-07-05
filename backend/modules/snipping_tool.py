import sys
from PyQt5 import QtWidgets, QtCore, QtGui
import tkinter as tk
# from PIL import ImageGrab
import pyscreenshot as ImageGrab
# import numpy as np
# import cv2


class MyWidget(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        root = tk.Tk()
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        screen_sizes_width = 0
        screen_sizes_height = 0
        # QtWidgets.QApplication.screens()
        print(QtWidgets.QApplication.desktop().screenNumber())
        for screen in QtWidgets.QApplication.screens():
            print(screen)
            print(screen.name())
            # print(screen.availableSize())
            print('Geometry')
            print(screen.availableGeometry())
            print(screen.availableSize())
            screen_sizes_width += screen.availableSize().width()
            screen_sizes_height += screen.availableSize().height()
            print(screen.virtualSize())
        print('Screen Sizes Width')
        print(screen_sizes_width)
        print('Screen Sizes Height')
        print(screen_sizes_height)
        
        # self.setGeometry(0, 0, screen_width, screen_height)
        # QtWidgets.QDesktopWidget()
        self.setGeometry(0, 0, screen_sizes_width, screen_sizes_height)
        self.setWindowTitle(' ')
        self.begin = QtCore.QPoint()
        self.end = QtCore.QPoint()
        self.setWindowOpacity(0.3)
        QtWidgets.QApplication.setOverrideCursor(
            QtGui.QCursor(QtCore.Qt.CrossCursor)
        )
        self.setWindowFlags(QtCore.Qt.FramelessWindowHint)
        print('Capture the screen...')
        self.showFullScreen()
        # self.show()

    def paintEvent(self, event):
        qp = QtGui.QPainter(self)
        qp.setPen(QtGui.QPen(QtGui.QColor('black'), 3))
        qp.setBrush(QtGui.QColor(128, 128, 255, 128))
        qp.drawRect(QtCore.QRect(self.begin, self.end))

    def mousePressEvent(self, event):
        print(event)
        print(event.globalPos())
        self.begin = event.globalPos()
        self.end = self.begin
        self.update()

    def mouseMoveEvent(self, event):
        self.end = event.globalPos()
        self.update()

    def mouseReleaseEvent(self, event):
        self.close()

        x1 = min(self.begin.x(), self.end.x())
        y1 = min(self.begin.y(), self.end.y())
        x2 = max(self.begin.x(), self.end.x())
        y2 = max(self.begin.y(), self.end.y())

        img = ImageGrab.grab(bbox=(x1, y1, x2, y2))
        img.save('capture.png')
        # img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2RGB)

        # cv2.imshow('Captured Image', img)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()


if __name__ == '__main__':
    app = QtWidgets.QApplication(sys.argv)
    window = MyWidget()
    window.show()
    app.aboutToQuit.connect(app.deleteLater)
    sys.exit(app.exec_())