import sys
import json

from PyQt5 import QtCore
from PyQt5.QtWidgets import QApplication, QWidget, QLabel, QRubberBand, QDialog, QLineEdit, QPushButton, QInputDialog
from PyQt5.QtGui import QIcon, QPixmap
from PIL import ImageGrab, ImageQt
import numpy


class App(QWidget):
    def __init__(self):
        super().__init__()
        # Destkop Screenshot
        desktop_capture = ImageGrab.grab()
        desktop_capture.save('desktop_capture_temp.png')

        self.area_defined = False
        self.imageName = None
        self.selected_area_center = None
        # Start the Qt UI
        self.initUI()
 
    def initUI(self): 
        # Create widget
        self.label = QLabel(self)
        pixmap = QPixmap('desktop_capture_temp.png')
        self.label.setPixmap(pixmap)
        self.showFullScreen()

    def keyPressEvent(self, keyPressed):
        key = keyPressed.key()
        if key == QtCore.Qt.Key_Return or key == QtCore.Qt.Key_Enter:
            self.hide()
            self.getImageName()
            self.cropQPixmap.save(self.imageName + '.png')
            try:
                self.offset_pos
            except AttributeError:
                pass
            else:
                with open(self.imageName + '.json', 'w') as outfile:
                    image_data = {'clickOffset': [self.offset_pos[0], self.offset_pos[1]]}
                    json.dump(image_data, outfile)
            self.close()
        elif key == QtCore.Qt.Key_Escape:
            self.close()

    def mousePressEvent(self, eventQMouseEvent):
        if self.area_defined == False:
            self.originQPoint = eventQMouseEvent.pos()
            self.currentQRubberBand = QRubberBand(QRubberBand.Rectangle, self)
            self.currentQRubberBand.setGeometry(QtCore.QRect(self.originQPoint, QtCore.QSize()))
            self.currentQRubberBand.show()
        elif self.area_defined == True:
            click_location = [eventQMouseEvent.pos().x(), eventQMouseEvent.pos().y()]
            self.offset_pos = [(click_location[0] - self.selected_area_center[0]), (~ (click_location[1] - self.selected_area_center[1]) + 1)]

    def mouseMoveEvent(self, eventQMouseEvent):
        if self.area_defined == False:
            self.currentQRubberBand.setGeometry(QtCore.QRect(self.originQPoint, eventQMouseEvent.pos()).normalized())

    def mouseReleaseEvent(self, eventQMouseEvent):
        if self.area_defined == False:
            currentQRect = self.currentQRubberBand.geometry()
            self.selected_area_center = [currentQRect.center().x(), currentQRect.center().y()]
            self.cropQPixmap = self.label.pixmap().copy(currentQRect)
            self.area_defined = True

    def getImageName(self):
        text, okPressed = QInputDialog.getText(self, "Get Image Name","Type Image Name:", QLineEdit.Normal, "")
        if okPressed and text != '':
            self.imageName = text

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = App()
    sys.exit(app.exec_())