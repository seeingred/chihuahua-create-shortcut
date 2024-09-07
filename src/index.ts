// import * as ws from 'windows-shortcuts'
import { getGamePath } from 'steam-game-path'
import fs from 'fs'
// @ts-ignore
import createDesktopShortcut from 'create-desktop-shortcuts'
import * as path from 'path'

type FileData = {
    uri: string;
    icon: string;
}

enum StoreType {
    STEAM = 'STEAM',
    EGS = 'EGS',
    STANDALONE = 'STANDALONE'
}

// const queryShortcut = (shortcut: string) => {
//     const promise = new Promise((resolve, reject) => {
//         const cb = (error: string | null, options?: ws.ShortcutOptions) => {
//             if (error) {
//                 reject(error)
//             }
//             console.log(options)
//             resolve(options)
//         }
//         try {
//             ws.query('C:/ProgramData/Microsoft/Windows/Start Menu/Windows Update.lnk', cb)
//         } catch (err) {
//             reject(err)
//         }
//     })
//     return promise
// }

// function to find exe file in a directory
function findExeFile(dir: string): string | null {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        if (path.extname(file) === '.exe') {
            return path.join(dir, file)
        }
    }
    return null
}

const main = async (chihuahuaPath: string, sourceFile: string) => {
    const sourceFileExtension = sourceFile.substring(sourceFile.lastIndexOf('.'))
    const sourceFileName = sourceFile.substring(sourceFile.lastIndexOf('\\') + 1)
    const sourceFileNameWithoutExtension = sourceFileName.substring(0, sourceFileName.lastIndexOf('.'))
    let fileData: FileData = {
        uri: '',
        icon: ''
    }
    if (sourceFileExtension === '.lnk') {
        // const shortcutData = await queryShortcut(sourceFile)
        throw new Error('Not implemented YET')
    } else if (sourceFileExtension === '.url') {
        const fileContent = fs.readFileSync(sourceFile, 'utf8')
        const fileLines = fileContent.split('\n')
        const urlLine = fileLines.find(line => line.startsWith('URL='))
        if (!urlLine) {
            throw new Error('URL line not found')
        }
        const uri = urlLine.substring(4).trim()
        let icon = ''
        const iconLine = fileLines.find(line => line.startsWith('IconFile='))
        if (iconLine) {
            icon = iconLine.substring('IconFile='.length).trim()
        }
        fileData = {
            uri,
            icon
        }
    }
    const chihuahuaDir = chihuahuaPath.substring(0, chihuahuaPath.lastIndexOf('\\')) + '\\'

    let store: StoreType = StoreType.STANDALONE
    if (sourceFileExtension === '.url' && fileData.uri.startsWith('steam://')) {
        store = StoreType.STEAM
    } else if (sourceFileExtension === '.url' && fileData.uri.startsWith('com.epicgames.launcher://')) {
        store = StoreType.EGS
    } else if (sourceFileExtension === '.lnk') {
        throw new Error('Not implemented YET')
    }

    const currentDir = process.cwd()

    const options = {
        filePath: chihuahuaPath,
        name: sourceFileNameWithoutExtension,
        comment: 'Launch in UEVR',
        workingDir: chihuahuaDir,
        icon: fileData.icon,
        outputPath: currentDir,
        arguments: ''
        // iconIndex: 0
    }

    if (store === StoreType.STEAM) {
        const gameID = parseInt(fileData.uri.substring('steam://rungameid/'.length))
        const gamePathObj = getGamePath(gameID)
        const gamePathUri = gamePathObj?.game?.path || ''
        // find game exe in dir
        const exeFilePath = findExeFile(gamePathUri)
        const gameName = gamePathObj?.game?.name || sourceFileNameWithoutExtension
        options.arguments = `"${exeFilePath}" --launch-cmd "${fileData.uri}"`
        options.name = gameName
    } else if (store === StoreType.EGS) {
        // gamePath in EGS is usually the same as icon path
        const exeFilePath = fileData.icon
        options.arguments = `${exeFilePath} --launch-cmd "${fileData.uri}"`
    }

    console.log(`LNK FILE OPTIONS:  `, options)
    const result = await createDesktopShortcut({
        windows: options
    })
    // console.log(`result:  `, result)
}

const chihuahuaPath = process.argv[2]
// console.log(`chihuahuaPath:  `, chihuahuaPath)
const sourceLnkFile = process.argv[3]
// console.log(`sourceLnkFile:  `, sourceLnkFile)
main(chihuahuaPath, sourceLnkFile)
